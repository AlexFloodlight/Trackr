<?php

class sqli_database {
	var $prefix = 'cly_';
	var $link;
	var $query_count = 0;
	var $row_count = 0;

	/**
	 *	constructor 
	 */
	function __construct($server, $user, $pass, $sql_db) {
    	$this->link = new mysqli($server, $user, $pass, $sql_db);
	}
    
	/**
	 *	close connection
	 */
    public function close() {
    	$this->link->mysqli_close();
    }
	
	/*
		runs a sql query
	*/
	public function query($sql) {
		$result = $this->link->query($sql);
		
		$this->query_count++;
		
        return $result;
    }
	
	/**
	 * @return array
	 */
	public function query_list_object($sql) {
		$result = $this->query($sql);
		
		if ($result) {
			$list = array();
			while ($row = $result->fetch_object()) {
				$list[] = $row;
			}
			return $list;
		}
		
		return false;
	} 
	
	/*
		returns the last generated auto_number field
	*/
	public function insert_id() {
		return $this->link->insert_id;
	}
	
	public function escape($string) {
		if (is_string($string)) {
			return $this->link->real_escape_string($string);
		} 
	}
}