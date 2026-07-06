// app/Http/Middleware/CheckRole.php
public function handle($request, Closure $next, $role)
{
    $token = $request->user()->currentAccessToken();
    
    if (!$token->can("role:$role")) {
        return response()->json(['message' => 'Akses tidak diizinkan'], 403);
    }
    
    return $next($request);
}