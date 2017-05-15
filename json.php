<?php
  // go with terminal in folder and do:
  // php -S localhost:8080
  // 
  // then everything you send as a parameter "json" gets saved as a json file

   $yes = $_POST['yes'];
   $no = $_POST['no'];

   /* sanity check */
   if (json_decode($yes) != null)
   {
     $file = fopen('https://github.com/asukhorukova1/declaring_word.git/data/yes/' . round(microtime(true) * 1000) . '_pamphletData.json','w+');
     fwrite($file, $yes);
     fclose($file);
   }
   else if (json_decode($no) != null)
   {
     $file = fopen('https://github.com/asukhorukova1/declaring_word.git/data/no/' . round(microtime(true) * 1000) . '_pamphletData.json','w+');
     fwrite($file, $no);
     fclose($file);
   }


?>
