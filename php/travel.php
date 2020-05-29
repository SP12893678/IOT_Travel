<?php
    $con = mysqli_connect("localhost","root","","travel");
    $con->query("set names utf8");
    $type = $_GET['type'];

    if($type == 'sign_up')
    {
        $icon = $_GET['icon'];
        $name = $_GET['name'];
        $account = $_GET['account'];
        $password = $_GET['password'];

        $sql = "SELECT * FROM user WHERE account = '".$account."'";
        $result = mysqli_query($con, $sql);
        if(mysqli_num_rows($result) == 0)
        {
            $sql = "INSERT INTO `user`(`icon`, `name`, `account`, `password`) VALUES ('".$icon."','".$name."','".$account."','".$password."')";
            $result = mysqli_query($con, $sql);
            echo "true";
        }
        else
        {
            echo "false";
        }
    }
    else if($type == 'login')
    {
        $account = $_GET['account'];
        $password = $_GET['password'];

        $sql = "SELECT * FROM user WHERE account = '".$account."' and password = '" .$password. "'";
        $result = mysqli_query($con, $sql);
        if(mysqli_num_rows($result) == 1)
        {
            // $data = "";
            //  while ($row = mysqli_fetch_array($result)) {
            //     $data .= json_encode($row, JSON_UNESCAPED_UNICODE);
            // }
            $data = mysqli_fetch_array($result);
            $data["result"] = "true";
            echo json_encode($data, JSON_UNESCAPED_UNICODE);
        }
        else
        {
            echo "false";
        }
    }
    else if($type == 'creat_room')
    {
        $roomkey = null;
        while(1){
            $roomkey = getRandomKey(5);
            $sql = "SHOW TABLES LIKE 'room_". $roomkey ."'";
            $result = mysqli_query($con, $sql);
            if(mysqli_num_rows($result) == 0)
                break;
        }
        
        $sql = "CREATE TABLE room_". $roomkey ."(account TEXT(12),name TEXT(12),icon TEXT(12),lat FLOAT(20),lng FLOAT(20))";
        $result = mysqli_query($con, $sql);
        echo $roomkey;
    }
    else if($type == 'enter_room')
    {
        $roomkey = $_GET['roomkey'];
        $sql = "SHOW TABLES LIKE 'room_". $roomkey ."'";
        $result = mysqli_query($con, $sql);
        if(mysqli_num_rows($result) == 1)
        {
            $account = $_GET['account'];
            $name = $_GET['name'];
            $icon = $_GET['icon'];
            $lat = $_GET['lat'];
            $lng = $_GET['lng'];

            $sql = "INSERT INTO 'room_". $roomkey ."'(`account`, `name`, `icon`,`lat`, `lng`) VALUES ('".$account."','".$name."','".$icon."','". $lat ."','". $lng ."')";
            $result = mysqli_query($con, $sql);
            echo $result;
        }
        else
        {
            echo "false";
        }
    }

function getRandomKey($length)
{
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    return $randomString;
}