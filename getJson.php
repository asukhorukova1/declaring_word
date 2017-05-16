<?php
  // go with terminal in folder and do:
  // php -S localhost:8080
  // 
  // then everything you send as a parameter "json" gets saved as a json file

$yesDir          = "data/yes";
$yes = array();

if(is_dir($yesDir)){

    if($dh = opendir($yesDir)){
        while(($file = readdir($dh)) != false){
            if(pathinfo($file)['extension'] == "json"){
              $yes[] = json_decode(file_get_contents($yesDir . "/" . $file)); // Add the file to the array
            }
        }
    }
}

$noDir          = "data/no";
$no = array();

if(is_dir($noDir)){
    if($dh = opendir($noDir)){
        while(($file = readdir($dh)) != false){
            if(pathinfo($file)['extension'] == "json"){
              $no[] = json_decode(file_get_contents($noDir . "/" . $file)); // Add the file to the array
            }
        }
    }
}

// create output array
$out = array();

// add first yes then no
$out[] = $yes;
$out[] = $no;

echo json_encode($out);

?>
