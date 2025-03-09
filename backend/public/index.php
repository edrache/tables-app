<?php

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

// Add Error Middleware
$errorMiddleware = new ErrorMiddleware(
    $app->getCallableResolver(),
    $app->getResponseFactory(),
    true,
    true,
    true
);
$app->add($errorMiddleware);

// Add routes
$app->get('/', function ($request, $response) {
    $response->getBody()->write(json_encode([
        'status' => 'success',
        'message' => 'RPG Table Generator API'
    ]));
    return $response->withHeader('Content-Type', 'application/json');
});

// Run app
$app->run(); 