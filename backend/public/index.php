<?php

use App\Controllers\TableController;
use App\Controllers\PageController;
use App\Middleware\JwtAuthMiddleware;
use DI\Container;
use Slim\Factory\AppFactory;
use Slim\Middleware\ErrorMiddleware;

require __DIR__ . '/../vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// Create Container
$container = new Container();

// Create App
AppFactory::setContainer($container);
$app = AppFactory::create();

// Register JWT Service in container
$container->set('jwt', function () {
    return new \App\Services\JwtService($_ENV['JWT_SECRET'] ?? 'your-secret-key');
});

// Register Auth Middleware
$container->set('auth', function () use ($container) {
    return new JwtAuthMiddleware($container->get('jwt'));
});

// Tables (protected routes)
$app->group('/api/tables', function ($app) {
    $app->post('', [TableController::class, 'create']);
    $app->get('', [TableController::class, 'list']);
    $app->get('/search', [TableController::class, 'search']);
    $app->get('/{id}', [TableController::class, 'get']);
})->add($container->get('auth'));

// Pages (mixed routes)
$app->group('/api/pages', function ($app) {
    // Public routes
    $app->get('', [PageController::class, 'list']);
    $app->get('/search', [PageController::class, 'search']);
    $app->get('/{id}', [PageController::class, 'get']);
    
    // Protected routes
    $app->post('', [PageController::class, 'create'])->add($container->get('auth'));
    $app->put('/{id}', [PageController::class, 'update'])->add($container->get('auth'));
});

// Add Error Middleware
$errorMiddleware = new ErrorMiddleware(
    $app->getCallableResolver(),
    $app->getResponseFactory(),
    true,
    true,
    true
);
$app->add($errorMiddleware);

// Run app
$app->run(); 