<?php

//Connect to DB
$db = new PDO('mysql:host=localhost;dbname=nhs;charset=utf8mb4', 'root', '  ');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

$stmt = $db->prepare('SELECT * FROM hospitals');
$stmt->execute();
$hospitals = $stmt->fetchAll(PDO::FETCH_ASSOC);

$i = 0;

foreach($hospitals as $hospital) {

  $stmt = $db->prepare('SELECT COUNT(*) AS total FROM hospitals WHERE name = ? and address = ?');
  $stmt->execute(array($hospital["name"], $hospital["address"]));
  $dupes = $stmt->fetchAll(PDO::FETCH_ASSOC);

  if($dupes[0]["total"] > 1) {
    $i++;
    echo $i . ": " . $hospital["name"] . " - " . $hospital["address"] . "\n";
  }

}
