<?php

//Connect to DB
$db = new PDO('mysql:host=localhost;dbname=nhs;charset=utf8mb4', 'root', '  ');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

$stmt = $db->prepare('SELECT DISTINCT name FROM historic');
$stmt->execute();
$trusts = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach($trusts as &$trust) {

  $trust["all_eu_staff"] = get_historic_data($db, $trust["name"], "All EU staff");
  $trust["doctors"] = get_historic_data($db, $trust["name"], "HCHS doctors");
  $trust["nurses"] = get_historic_data($db, $trust["name"], "Nurses & health visitors");
  $trust["midwives"] = get_historic_data($db, $trust["name"], "Midwives");

}

$json = json_encode($trusts,JSON_NUMERIC_CHECK);
echo $json;

function get_historic_data($db, $name, $type_clean) {

  $stmt = $db->prepare('SELECT date, total FROM historic WHERE name = ? AND type = ?');
  $stmt->execute(array($name, $type_clean));
  $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

  $dates = ['x'];
  $totals = ['total'];
  foreach($data as $d) {
    array_push($dates, str_replace("31/01/", "", $d["date"]));
    array_push($totals, $d["total"]);
  }

  $ar = [];

  $ar["dates"] = $dates;
  $ar["totals"] = $totals;

  return $ar;

}
