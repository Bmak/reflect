<?php


  function dbconnect(){ //����������� � ��
	$user="XXXXX";
	$pass="XXXXX";
	$connection=0;
	$connection = mysql_connect('localhost', $user, $pass);
	if (!mysql_select_db($user, $connection)){
	  echo "NOT CONNECTED<br>";
	}	
	mysql_query("SET NAMES 'utf8'");
	mysql_query("SET CHARACTER SET 'utf8'");
	mysql_query("SET SESSION collation_connection = 'utf8_unicode_ci'");
	return 	$connection;
//������ � ������� MySQL ������ � UTF-8, ����� ������ ������� ��� ��������� �� phpMyAdmin
//mysql_query("set character_set_connection=cp1251;",$connection);

//������ ������� ��������� �� WEB ����� ������� � ��������� cp1251
//mysql_query("set character_set_client=cp1251;",$connection);

//������ ������� ��������� � WEB ����� ��� ������������ ����� � ��������� cp1251
//mysql_query("set character_set_results=cp1251",$connection);

//mysql_query("set names cp1251",$connection);
  }
  
	function dbdisconnect($c){ //������������� � ��
		mysql_close($c);		
	}
?>