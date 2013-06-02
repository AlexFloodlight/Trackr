<?php
global $db;

define( 'DB_HOST', 'localhost' );
define( 'DB_USER', 'root' );
define( 'DB_PASSWORD', 'root' );
define( 'DB_NAME', 'trackr' );

require_once ( 'mysqli.php' );

$db = new sqli_database(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);

class AjaxResponse {
	private $_commands = array();
	
	public $result;
	
	public function addCommand( $cmd ) {
		$this->_commands[] = $cmd;
	}
	
	public function runCommand( $name ) {
		foreach( $this->_commands as $cmd ) {
			if ($this->result = $cmd->onCommand( $name )) {
				return;
			}
		}
	}
	
	public function printResponse() {
		header( "Content-Type: application/json" );
		echo json_encode($this->result);
		exit;
	}
}

class TrackrActions {
	public function onCommand( $name ) {
		if (method_exists(get_class(), $name)) {
			return $this->$name();
		} else {
			return false;
		}
	}
	
	public function button() {
		global $db;
		$last_record = $db->query_list_object("SELECT `id` FROM records WHERE `user_id` = 1 AND `time_end` IS NULL");
		
		$db->query("UPDATE records SET `time_end` = NOW() WHERE `user_id` = 1 AND `time_end` IS NULL");
		$db->query("INSERT INTO records (`user_id`, `time_start`) VALUES (1, NOW())");
		
		$result = array(
			'success' => true,
		);
		
		if (!empty($last_record)) {
			$result = array(
				'success' => true,
				'track_id' => intval($last_record[0]->id), 
				'time' => time()
			);
		}
		return $result;
	}
	
	public function name() {
		global $db;
		$db->query("UPDATE records SET `name` = '{$_POST['name']}' WHERE `user_id` = 1 AND `id` = '{$_POST['id']}'");
		$result = array(
			'success' => true,
		);
		return $result;
	}
	
	public function finish() {
		global $db;
		$last_record = $db->query_list_object("SELECT `id` FROM records WHERE `user_id` = 1 AND `time_end` IS NULL");
		
		$db->query("UPDATE records SET `time_end` = NOW() WHERE `user_id` = 1 AND `time_end` IS NULL");
		
		$result = array(
			'success' => false,
		);
		
		if (!empty($last_record)) {
			$result = array(
				'success' => true,
				'type_reponse' => 'last_record',
				'track_id' => intval($last_record[0]->id), 
				'time' => time()
			);
		} else {
			$records = $db->query_list_object("SELECT `time_start`, `time_end`, `name`, TIMESTAMPDIFF(MINUTE, `time_start`, `time_end`) as age FROM `records` WHERE `user_id` = 1 AND TIMESTAMPDIFF(MINUTE, `time_start`, `time_end`) > 0");	
			
			$result = array(
				'success' => true,
				'type_reponse' => 'records',
				'records' => $records
			);
		}
		return $result;
	}
}

$ajax_response = new AjaxResponse();
$ajax_response->addCommand( new TrackrActions );
$ajax_response->runCommand($_POST['action']);
$ajax_response->printResponse();
