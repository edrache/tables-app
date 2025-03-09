<?php

namespace App\Controllers;

use App\Models\Page;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Psr7\Factory\ResponseFactory;

class PageController
{
    private ResponseFactory $responseFactory;

    public function __construct()
    {
        $this->responseFactory = new ResponseFactory();
    }

    public function create(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody();
        $user = $request->getAttribute('user');
        
        if (!isset($data['title']) || !isset($data['content'])) {
            $response = $this->responseFactory->createResponse(400);
            $response->getBody()->write(json_encode([
                'error' => 'Title and content are required'
            ]));
            return $response->withHeader('Content-Type', 'application/json');
        }
        
        $page = Page::create([
            'title' => $data['title'],
            'content' => $data['content'],
            'is_public' => $data['is_public'] ?? true,
            'user_id' => $user->id,
        ]);
        
        $response->getBody()->write(json_encode($page));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function list(Request $request, Response $response): Response
    {
        $pages = Page::public()->with('user')->get();
        $response->getBody()->write(json_encode($pages));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function search(Request $request, Response $response): Response
    {
        $query = $request->getQueryParam('q', '');
        
        $pages = Page::public()
            ->where('title', 'LIKE', "%{$query}%")
            ->with('user')
            ->get();
            
        $response->getBody()->write(json_encode($pages));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function get(Request $request, Response $response, array $args): Response
    {
        try {
            $page = Page::with('user')->findOrFail($args['id']);
            
            // Sprawdź, czy strona jest publiczna lub czy użytkownik jest jej właścicielem
            $user = $request->getAttribute('user');
            if (!$page->is_public && (!$user || $user->id !== $page->user_id)) {
                throw new \Exception('Page is private');
            }
            
            $response->getBody()->write(json_encode($page));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response = $this->responseFactory->createResponse(404);
            $response->getBody()->write(json_encode([
                'error' => 'Page not found or access denied'
            ]));
            return $response->withHeader('Content-Type', 'application/json');
        }
    }

    public function update(Request $request, Response $response, array $args): Response
    {
        try {
            $user = $request->getAttribute('user');
            $page = Page::findOrFail($args['id']);
            
            if ($page->user_id !== $user->id) {
                $response = $this->responseFactory->createResponse(403);
                $response->getBody()->write(json_encode([
                    'error' => 'You are not authorized to edit this page'
                ]));
                return $response->withHeader('Content-Type', 'application/json');
            }
            
            $data = $request->getParsedBody();
            if (!isset($data['title']) || !isset($data['content'])) {
                $response = $this->responseFactory->createResponse(400);
                $response->getBody()->write(json_encode([
                    'error' => 'Title and content are required'
                ]));
                return $response->withHeader('Content-Type', 'application/json');
            }
            
            $page->update([
                'title' => $data['title'],
                'content' => $data['content'],
                'is_public' => $data['is_public'] ?? $page->is_public,
            ]);
            
            $response->getBody()->write(json_encode($page));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response = $this->responseFactory->createResponse(404);
            $response->getBody()->write(json_encode([
                'error' => 'Page not found'
            ]));
            return $response->withHeader('Content-Type', 'application/json');
        }
    }
} 