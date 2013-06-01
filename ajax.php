<?php

define( 'DB_HOST', 'localhost' );
define( 'DB_USER', 'root' );
define( 'DB_PASSWORD', 'root' );
define( 'DB_NAME', 'trackr' );

require_once ( 'mysqli.php' );

$db = new sqli_database(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);

switch ($_POST['action']) {
	case 'button' :
		$last_record = $db->query_list_object("SELECT `id` FROM records WHERE `user_id` = 1 AND `time_end` IS NULL");
		$db->query("UPDATE records SET `time_end` = NOW() WHERE `user_id` = 1 AND `time_end` IS NULL");
		$db->query("INSERT INTO records (`user_id`, `time_start`) VALUES (1, NOW())");
		$result = array(
			'success' => true,
			'track_id' => intval($last_record[0]->id), 
			'time' => time()
		);
		break;
	case 'name' :
		$db->query("UPDATE records SET `name` = '{$_POST['name']}' WHERE `user_id` = 1 AND `id` = '{$_POST['id']}'");
		$result = array(
			'success' => true,
		);
		break;
	case 'finish' :
		$last_record = $db->query_list_object("SELECT `id` FROM records WHERE `user_id` = 1 AND `time_end` IS NULL");
		$db->query("UPDATE records SET `time_end` = NOW() WHERE `user_id` = 1 AND `time_end` IS NULL");
		$result = array(
			'success' => true,
			'track_id' => intval($last_record[0]->id), 
			'time' => time()
		);
		break;
}

header( "Content-Type: application/json" );
echo json_encode($result);
exit;	