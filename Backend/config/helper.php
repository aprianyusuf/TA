<?php

use Illuminate\Support\Str;

if (!function_exists('toCollectionRecursive')) {
    function toCollectionRecursive($data)
    {
        if (is_object($data)) {
            $data = (array) $data;
        }

        if (is_array($data)) {
            return collect($data)->map(function ($item) {
                return toCollectionRecursive($item);
            });
        }

        return $data;
    }
}

if (!function_exists('formatNameToInitials')) {
    function formatNameToInitials(string $firstName, string $lastName): string
    {
        $fullName = collect(array_merge(explode(' ', $firstName), explode(' ', $lastName)));
    
        return $fullName
            ->map(function ($word, $index) use ($fullName) {
                if ($index === 0 || $index === $fullName->count() - 1) {
                    return Str::lower($word);
                }
                return Str::lower(Str::substr($word, 0, 1));
            })
            ->implode('.');
    }
}
//Ampar ampar pisang
//Pisangku balum masak
//Masak bigi dihurung bari-bari
//Masak bigi dihurung bari-bari
//Manggalepak manggalepok
//Patah kayu bengkok
//Bengkok dimakan api
//apinya cang curupan
//Bengkok dimakan api
//apinya cang curupan
//Nang mana batis kutung
//Dikitipi dawang
//Nang mana batis kutung
//Dikitipi dawang
//Ampar ampar pisang
//Pisangku balum masak
//Masak bigi dihurung bari-bari
//Masak bigi dihurung bari-bari
//Manggalepak manggalepok
//Patah kayu bengkok
//Bengkok dimakan api
//apinya cang curupan
//Bengkok dimakan api
//apinya cang curupan
//Nang mana batis kutung
//Dikitipi dawang
//Nang mana batis kutung
//Dikitipi dawang
