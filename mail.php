<?php
    $to = 'demo@site.com';
    $name = $_GET["name"];
    $email= $_GET["email"];
    $text= $_GET["message"];
    $subject= $_GET["subject"];
    


    
    $message ='
    <table style="width:100%">
        <tr>
            <td>'.$name.'  '.$subject.'</td>
        </tr>
        <tr><td>Email: '.$email.'</td></tr>
        <tr><td>phone: '.$subject.'</td></tr>
        <tr><td>Text: '.$text.'</td></tr>
        
    </table>';

    if (@mail($to, $email, $message, $headers))
    {
        echo 'Your message has been sent.';
    }else{
        echo 'failed';
    }

?>
