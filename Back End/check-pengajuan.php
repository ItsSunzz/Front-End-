<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$submissions = App\Models\Pengajuan::with(['program', 'user'])->latest()->get()->map(function($p) {
    return [
        'id' => $p->pengajuan_id,
        'pengajuan_id_direct' => $p->getAttribute('pengajuan_id'),
        'id_attr' => $p->id,
        'attributes' => $p->getAttributes(),
    ];
});

echo json_encode($submissions, JSON_PRETTY_PRINT);
