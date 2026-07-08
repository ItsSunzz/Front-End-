<?php

namespace Database\Seeders;

use App\Models\Desa;
use App\Models\District;
use Illuminate\Database\Seeder;

class DesaSeeder extends Seeder
{
    public function run(): void
    {
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        Desa::truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

        $desaMap = [
            'Ampel' => [
                'Banyuanyar', 'Candi', 'Candisari', 'Gladagsari', 'Gondang Slamet',
                'Jlarem', 'Kaligentong', 'Kembang', 'Ngadirojo', 'Ngagrong',
                'Ngampon', 'Ngargoloko', 'Ngargosari', 'Ngenden', 'Sampetan',
                'Seboto', 'Selodoko', 'Sidomulyo', 'Tanduk', 'Urutsewu'
            ],
            'Andong' => [
                'Andong', 'Beji', 'Gondangrawe', 'Kacangan', 'Kadipaten',
                'Kedungdowo', 'Kunti', 'Mojo', 'Ngadirojo', 'Pakel',
                'Pulosari', 'Semawung', 'Sempu', 'Sumberagung', 'Tawang', 'Tembeling'
            ],
            'Banyudono' => [
                'Bangak', 'Banyudono', 'Batan', 'Bendan', 'Cangkringan',
                'Denggungan', 'Dukuh', 'Jembungan', 'Jipangan', 'Ketaon',
                'Kuwiran', 'Ngaru-aru', 'Sambon', 'Trayu'
            ],
            'Boyolali' => [
                'Boyolali', 'Siswodipuran', 'Pulisen',
                'Karanggeneng', 'Winong', 'Penggung', 'Kiringan', 'Mudal', 'Kebonbimo'
            ],
            'Cepogo' => [
                'Bakulan', 'Cabeankunti', 'Cepogo', 'Gedangan', 'Genting',
                'Jatirejo', 'Jelok', 'Jombong', 'Kembang', 'Mliwis',
                'Paras', 'Sukabumi', 'Sumbung', 'Wonodoyo', 'Wonorejo'
            ],
            'Gladagsari' => [
                'Gladagsari', 'Jlarem', 'Kaligentong', 'Ngagrong', 'Ngargoloka',
                'Seboto', 'Selodoko', 'Sampetan', 'Candisari', 'Banyuanyar'
            ],
            'Juwangi' => [
                'Juwangi', 'Jerukan', 'Kalimati', 'Kayen', 'Krobokan',
                'Ngaren', 'Ngleses', 'Pilangrejo', 'Pojok'
            ],
            'Karanggede' => [
                'Bangkok', 'Banteng', 'Dongkelsari', 'Grogol', 'Karanggede',
                'Kebonan', 'Klampok', 'Landungan', 'Mojokerto', 'Ngampin',
                'Pinggir', 'Purbosari', 'Sendang', 'Sranten', 'Tegalrejo', 'Tempursari'
            ],
            'Kemusu' => [
                'Bawen', 'Geneng', 'Jrahi', 'Kedungmulyo', 'Kemusu',
                'Kendel', 'Klewor', 'Kuwu', 'Lemahireng', 'Ngemplak',
                'Siyono', 'Tlogowungu', 'Wonoharjo'
            ],
            'Klego' => [
                'Bade', 'Banyuurip', 'Blumbang', 'Gondanglegi', 'Kalangan',
                'Karangmojo', 'Klego', 'Mojosari', 'Ngombak', 'Pandeyan',
                'Senden', 'Sumberagung', 'Tanjung'
            ],
            'Mojosongo' => [
                'Mojosongo', 'Kemiri', 'Brajan', 'Butuh', 'Dlingo',
                'Jurug', 'Karangnongko', 'Kragilan', 'Madu', 'Manggis',
                'Metuk', 'Singosari', 'Tambak'
            ],
            'Musuk' => [
                'Cluntang', 'Kembangsari', 'Kepurun', 'Musuk', 'Ngadiroyo',
                'Pagerjurang', 'Pusporenggo', 'Ringinlarik', 'Sruni', 'Sukorame',
                'Sumbung', 'Sumberejo'
            ],
            'Ngemplak' => [
                'Dibal', 'Donohudan', 'Gagaksipat', 'Giriroto', 'Kismoyoso',
                'Manggung', 'Ngemplak', 'Pandan', 'Pandes', 'Sawahan',
                'Sobokerto', 'Sumberejo'
            ],
            'Nogosari' => [
                'Bendungan', 'Grembyangan', 'Jetis', 'Karanggede', 'Kebonagung',
                'Keyongan', 'Nogosari', 'Pojok', 'Potronayan', 'Rembun',
                'Sembungan', 'Simbangan', 'Sumberejo'
            ],
            'Sambi' => [
                'Canden', 'Catur', 'Gagakan', 'Jatisari', 'Juwangi',
                'Kalisari', 'Kebonharjo', 'Ngaglik', 'Nglembu', 'Sambi',
                'Senting', 'Tawengan', 'Tempursari', 'Trombol', 'Watualang', 'Wonosari'
            ],
            'Sawit' => [
                'Bendosari', 'Cepokosawit', 'Gombang', 'Guwokajen', 'Jatirejo',
                'Jenengan', 'Karangduren', 'Kateguhan', 'Kemasan', 'Manjung',
                'Tegalrejo', 'Tlawong'
            ],
            'Selo' => [
                'Jrakah', 'Klakah', 'Lencoh', 'Senden', 'Selo',
                'Tlogolele', 'Samiran', 'Suroteleng', 'Jaten', 'Kebonagung'
            ],
            'Simo' => [
                'Bendungan', 'Blimbing', 'Gedangan', 'Gunung', 'Juwangi',
                'Karang', 'Kedung', 'Pelem', 'Simo', 'Sumber', 'Talak',
                'Temon', 'Walen'
            ],
            'Tamansari' => [
                'Dragan', 'Jemowo', 'Karanganyar', 'Karangkendal', 'Keposong',
                'Lampar', 'Lanjaran', 'Mriyan', 'Sangup', 'Sumur'
            ],
            'Teras' => [
                'Bangsalan', 'Doplang', 'Gumukrejo', 'Kadireso', 'Kopen',
                'Krasak', 'Mojolegi', 'Nepen', 'Randusari', 'Salakan',
                'Sudimoro', 'Tawangsari', 'Teras'
            ],
            'Wonosamudro' => [
                'Bengle', 'Bercak', 'Garangan', 'Gilirejo', 'Gunungsari',
                'Jatilawang', 'Kalinanas', 'Kedungpilang', 'Ngablak', 'Repaking'
            ],
            'Wonosegoro' => [
                'Banyusri', 'Bendungan', 'Bercak', 'Bolo', 'Gamping',
                'Gintungan', 'Jatingarang', 'Jetis', 'Karangjati', 'Karangrejo',
                'Kateguhan', 'Kebonagung', 'Kedung', 'Lemahireng', 'Mojosari',
                'Ngablak', 'Pager', 'Wonosegoro'
            ]
        ];

        foreach ($desaMap as $kecamatanName => $desaList) {
            $district = District::where('name', $kecamatanName)->first();
            if ($district) {
                foreach ($desaList as $namaDesa) {
                    Desa::create([
                        'kecamatan_id' => $district->id,
                        'nama_desa' => $namaDesa
                    ]);
                }
            }
        }
    }
}