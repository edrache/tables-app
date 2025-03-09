<?php

namespace App\Middleware;

use App\Services\JwtService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Slim\Psr7\Factory\ResponseFactory;

class JwtAuthMiddleware implements MiddlewareInterface
{
    private JwtService $jwtService;
    private ResponseFactory $responseFactory;

    public function __construct(JwtService $jwtService)
    {
        $this->jwtService = $jwtService;
        $this->responseFactory = new ResponseFactory();
    }

    public function process(Request $request, RequestHandlerInterface $handler): Response
    {
        $token = $request->getHeaderLine('Authorization');
        
        if (empty($token)) {
            $response = $this->responseFactory->createResponse(401);
            $response->getBody()->write(json_encode([
                'error' => 'Unauthorized - No token provided'
            ]));
            return $response->withHeader('Content-Type', 'application/json');
        }

        try {
            $token = str_replace('Bearer ', '', $token);
            $payload = $this->jwtService->decode($token);
            
            if (!isset($payload->id)) {
                throw new \Exception('Invalid token payload');
            }
            
            return $handler->handle($request->withAttribute('user', $payload));
        } catch (\Exception $e) {
            $response = $this->responseFactory->createResponse(401);
            $response->getBody()->write(json_encode([
                'error' => 'Unauthorized - Invalid token'
            ]));
            return $response->withHeader('Content-Type', 'application/json');
        }
    }
} 