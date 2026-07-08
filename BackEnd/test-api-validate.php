<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

try {
    $user = App\Models\User::where('role', 'super_admin')->first();
    if (!$user) {
        echo "Error: No super admin user found\n";
        exit;
    }
    Auth::login($user);

    $pengajuan = App\Models\Pengajuan::first();
    if (!$pengajuan) {
        echo "Error: No pengajuan found\n";
        exit;
    }

    $request = Request::create("/api/pengajuan/{$pengajuan->pengajuan_id}/validate", 'PATCH', [
        'status_pengajuan' => 'disetujui',
        'catatan_pengajuan' => 'Test approval',
    ]);
    $request->setUserResolver(function () use ($user) {
        return $user;
    });

    $response = Route::dispatch($request);
    echo "Status: " . $response->getStatusCode() . "\n";
    echo "Content: " . $response->getContent() . "\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
