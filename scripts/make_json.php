<?php

//Connect to DB
$db = new PDO('mysql:host=localhost;dbname=nhs;charset=utf8mb4', 'root', '  ');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

$stmt = $db->prepare('SELECT DISTINCT hospitals.id, hospitals.lat, hospitals.lon, hospitals.name, trusts.name as trust, trusts.name as clean_trust, trusts.id as trust_id, eu_staff_perc, frontline_perc, doctors_perc, nurses_perc, midwives_perc FROM hospitals LEFT JOIN trusts ON hospitals.trust = trusts.name WHERE trusts.name IS NOT NULL ORDER BY eu_staff_perc ASC');
$stmt->execute();
$hospitals = $stmt->fetchAll(PDO::FETCH_ASSOC);

for($i=0; $i<count($hospitals); $i++) {
  $hospitals[$i]["trust"] = str_replace(" ", "_", $hospitals[$i]["trust"]);
  $hospitals[$i]["trust"] = str_replace("'", "", $hospitals[$i]["trust"]);
  $hospitals[$i]["trust"] = str_replace(",", "", $hospitals[$i]["trust"]);
}

$json = json_encode($hospitals,JSON_NUMERIC_CHECK);
echo $json;
