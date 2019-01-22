


<?php
$username = $_POST['username'];
$email = $_POST['email'];

$password = $_POST['password'];

$password2 = $_POST['password2'];

echo $email." hello";


if (!empty($username) || !empty($email) || !empty($password) || !empty($password2)){

	$host = "localhost";
	$dbUsername= "root";
	$dbpassword="";
	$dbname="blockchain";



$conn = new mysqli($host, $dbUsername, $dbpassword, $dbname);
if(mysqli_connect_error()){
	die('connect error('.mysqli_connect_errno().')'.mysqli_connect_error());
}else{
$SELECT = "SELECT email From register where email = ? limit 1";
$INSERT = "INSERT Into register(username ,email,password,password2) values (?,?,?,?)";

$stmt = $conn->prepare($SELECT);
$stmt->bind_param("s",$email);
$stmt->execute();
$stmt->bind_result($email);
$stmt->store_result();
$rnum = $stmt->num_rows;

if($rnum==0){
	$stmt->close();
	$stmt = $conn->prepare($INSERT);
	$stmt->bind_param("ssss", $username, $email, $password, $password2);
	$stmt->execute();
	echo "new record inserted succesfull";

}else{
	echo "someone already using this email id";
}
$stmt->close();
$conn->close();


}
}else{
	echo "all field are required";
	die();
}


?>