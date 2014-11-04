<?php 

$info = json_encode(array(
	'user' => array(
		'name' => 'Jonnas Fonini',
		'email' => 'jonnas@sbsistemas.com.br',
		'role' => 'end-user',
		'verified' => true // usado para não enviar email de confirmação para o usuário
	)
));


$ch = curl_init();
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
curl_setopt($ch, CURLOPT_URL, 'https://gestorcfc.zendesk.com/api/v2/users.json');
curl_setopt($ch, CURLOPT_USERPWD, 'gestorcfc@gestorcfc.com.br/token:vsQn01SUHONcmpS6hNWVUzzhvNk52LmDRvael4tR'); 
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);
curl_setopt($ch, CURLOPT_VERBOSE, TRUE);
curl_setopt($ch, CURLOPT_POSTFIELDS, $info);
curl_setopt($ch, CURLOPT_POST, 1); 
$result = curl_exec($ch);

if (curl_errno($ch)) {
	print curl_error($ch);
} 
else {
	curl_close($ch);
}

$dados = json_decode($result);


$info = array(
	'password' => 'teste'
);

$ch = curl_init();
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
curl_setopt($ch, CURLOPT_URL, 'https://gestorcfc.zendesk.com/api/v2/users/'.$dados->user->id.'/password.json');
curl_setopt($ch, CURLOPT_USERPWD, 'gestorcfc@gestorcfc.com.br/token:vsQn01SUHONcmpS6hNWVUzzhvNk52LmDRvael4tR'); 
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);
curl_setopt($ch, CURLOPT_VERBOSE, TRUE);
curl_setopt($ch, CURLOPT_POSTFIELDS, $info);
curl_setopt($ch, CURLOPT_POST, 1);
$result = curl_exec($ch);

if (curl_errno($ch)) {
	print curl_error($ch);
} 
else {
	curl_close($ch);
}

$dados = json_decode($result);

print_r($dados);

?>