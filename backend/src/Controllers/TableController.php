<?php

namespace App\Controllers;

use App\Models\Table;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Psr7\Factory\ResponseFactory;

class TableController
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
        
        if (!isset($data['name']) || !isset($data['content'])) {
            $response = $this->responseFactory->createResponse(400);
            $response->getBody()->write(json_encode([
                'error' => 'Name and content are required'
            ]));
            return $response->withHeader('Content-Type', 'application/json');
        }
        
        $table = Table::create([
            'name' => $data['name'],
            'content' => $data['content'],
            'user_id' => $user->id,
        ]);
        
        $response->getBody()->write(json_encode($table));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function list(Request $request, Response $response): Response
    {
        $user = $request->getAttribute('user');
        $tables = Table::where('user_id', $user->id)->with('user')->get();
        
        $response->getBody()->write(json_encode($tables));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function search(Request $request, Response $response): Response
    {
        $query = $request->getQueryParam('q', '');
        $user = $request->getAttribute('user');
        
        $tables = Table::where('user_id', $user->id)
            ->where('name', 'LIKE', "%{$query}%")
            ->with('user')
            ->get();
            
        $response->getBody()->write(json_encode($tables));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function get(Request $request, Response $response, array $args): Response
    {
        $user = $request->getAttribute('user');
        
        try {
            $table = Table::where('user_id', $user->id)
                ->with('user')
                ->findOrFail($args['id']);
                
            $response->getBody()->write(json_encode($table));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response = $this->responseFactory->createResponse(404);
            $response->getBody()->write(json_encode([
                'error' => 'Table not found'
            ]));
            return $response->withHeader('Content-Type', 'application/json');
        }
    }
} 