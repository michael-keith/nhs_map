<?php

//Connect to DB
$db = new PDO('mysql:host=localhost;dbname=nhs;charset=utf8mb4', 'root', '  ');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

$stmt = $db->prepare('SELECT * FROM trusts ORDER BY id');
$stmt->execute();
$trusts = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach($trusts as &$trust) {
  $stmt = $db->prepare('SELECT constituency FROM hospitals LEFT JOIN trusts on hospitals.trust = trusts.name WHERE hospitals.trust = ? AND constituency IS NOT NULL GROUP BY constituency');
  $stmt->execute(array($trust["name"]));
  $constits = $stmt->fetchAll(PDO::FETCH_ASSOC);

  //Vague code which corrects some parity issues
  // if(count($constits) == 0) {
  //   //
  //   // $stmt = $db->prepare('SELECT trust FROM hospitals WHERE trust LIKE ?');
  //   // $stmt->execute(array("%" . $trust["name"] . "%"));
  //   // $true_trust_name = $stmt->fetchAll(PDO::FETCH_ASSOC);
  //   //
  //   // if($true_trust_name[0]["trust"]) {
  //   //   $stmt = $db->prepare('UPDATE trusts SET name = ? WHERE name = ?');
  //   //   $stmt->execute(array($true_trust_name[0]["trust"], $trust["name"]));
  //   // }
  //   //
  //   // echo "CHANGED: " . $true_trust_name[0]["trust"] . " to " . $trust["name"];
  //   // var_dump($constits);
  //
  // // echo $trust["name"];
  // // var_dump($constits);
  // }

  $trust["constits"] = [];

  foreach($constits as $constit) {
    $stmt = $db->prepare('SELECT * FROM constits WHERE name = ?');
    $stmt->execute(array( str_replace(",","",$constit["constituency"]) ));
    $con = $stmt->fetchAll(PDO::FETCH_ASSOC);

    array_push($trust["constits"], $con);
  }

}

$json = json_encode($trusts,JSON_NUMERIC_CHECK);
echo $json;
