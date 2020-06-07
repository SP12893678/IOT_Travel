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
        
        $sql = "CREATE TABLE room_". $roomkey ."(account VARCHAR(12),name VARCHAR(12),icon VARCHAR(12),lat FLOAT(20),lng FLOAT(20))";
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
            $sql = "SELECT * FROM room_". $roomkey ." WHERE account = '".$account."'";
            $result = mysqli_query($con, $sql);
            if(mysqli_num_rows($result) == 1)
            {
                $sql = "UPDATE `room_". $roomkey ."` SET `account`='".$account."',`name`='".$name."',`icon`='".$icon."',`lat`=".$lat.",`lng`=".$lng." WHERE account = '". $account ."'";
            }
            else if(mysqli_num_rows($result) == 0)
            {
                $sql = "INSERT INTO room_". $roomkey ."(`account`, `name`, `icon`,`lat`, `lng`) VALUES ('".$account."','".$name."','".$icon."',". $lat .",". $lng .")";
            }
            $result = mysqli_query($con, $sql);
            echo ($result == 1)?"true":"false";
        }
        else
        {
            echo "false";
        }
    }
    else if($type == 'room_data')
    {
        $roomkey = $_GET['roomkey'];
        $sql = "SHOW TABLES LIKE 'room_". $roomkey ."'";
        $result = mysqli_query($con, $sql);
        if(mysqli_num_rows($result) == 1)
        {
            $sql = "SELECT * FROM room_". $roomkey;
            $result = mysqli_query($con, $sql);
            $count = 0;
            $total = mysqli_num_rows($result);
            $room_data = "";
            while($row = mysqli_fetch_array($result))
            {
                $count++;
                $room_data .= json_encode($row, JSON_UNESCAPED_UNICODE);
                $room_data .=($count < $total && $count != $total)?',':'';
            }
            $room_data = "[".$room_data."]";
            $data = [];
            $data["result"] = "true";
            $data["data"] = $room_data;
            echo json_encode($data, JSON_UNESCAPED_UNICODE);
        }
        else
        {
            echo "false";
        }
    }
    else if($type == 'exit_room')
    {
        $roomkey = $_GET['roomkey'];
        $account = $_GET['account'];
        $sql = "DELETE FROM room_". $roomkey ." WHERE account = '".$account."'";
        // $sql = "DELETE FROM `room_erkvb` WHERE account = 'test666'";
        $result = mysqli_query($con, $sql);
        $sql = "SELECT * FROM room_". $roomkey ." WHERE 1";
        $result = mysqli_query($con, $sql);
        if(mysqli_num_rows($result) == 0)
        {
            $sql = "DROP TABLE room_". $roomkey;
            $result = mysqli_query($con, $sql);
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