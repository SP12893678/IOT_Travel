<?php
    session_start();
    $con = mysqli_connect("localhost","root","","travel");
    $con -> query("set names utf8");
    $type = $_GET['type'];
    $data = [];

    switch ($type) {
        case 'sign_in':
            $account = $_GET['account'];
            $password = $_GET['password'];
            $data = Sign_in($con,$account,$password);
            echo $data;
            break;
        case 'sign_up':
            $icon = $_GET['icon'];
            $name = $_GET['name'];
            $account = $_GET['account'];
            $password = $_GET['password'];
            $data = Sign_up($con,$icon,$name,$account,$password);
            echo $data;
            break;
        case 'creat_room':
            $data = Creat_room_table($con);
            echo $data;
            break;
        case 'enter_room':
            $roomkey = $_GET['roomkey'];
            $icon = $_GET['icon'];
            $name = $_GET['name'];
            $account = $_GET['account'];
            $lat = $_GET['lat'];
            $lng = $_GET['lng'];
            $data = Enter_room($con,$icon,$name,$account,$lat,$lng,$roomkey);
            echo $data;
            break;
        case 'read_room':
            $roomkey = $_GET['roomkey'];
            $data = Read_room($con,$roomkey);
            echo $data;
            break;
        case 'exit_room':
            $roomkey = $_GET['roomkey'];
            $account = $_GET['account'];
            Leave_room($con,$account,$roomkey);
            break;
        default:
            # code...
            $data["result"] = "false";
            $data["error"] = "Wrong Post Type";
            return $data;
            break;
    }


    function Sign_in($con,$account,$password)
    {
        /*
        * check account if exist
        */
        $sql = "SELECT * FROM user WHERE account = '".$account."'";
        $result = mysqli_query($con, $sql);
        if(mysqli_num_rows($result) == 1)
        {
            /*
            * check account and password whether or not login succeeded
            */
            $sql = "SELECT * FROM user WHERE account = '".$account."' and password = '" .$password. "'";
            $result = mysqli_query($con, $sql);
            if(mysqli_num_rows($result) == 1)
            {
                $data["data"] = mysqli_fetch_array($result);
                $data["result"] = "true";
            }
            else
            {
                $data["result"] = "false";
                $data["error"] = "Password is incorrect.";
            }
        }
        else
        {
            $data["result"] = "false";
            $data["error"] = "Account is not exist.";
        }
        return json_encode($data, JSON_UNESCAPED_UNICODE);
    }

    function Sign_up($con,$icon,$name,$account,$password)
    {
        /*
        * check account if not exist
        */
        $sql = "SELECT * FROM user WHERE account = '".$account."'";
        $result = mysqli_query($con, $sql);
        if(mysqli_num_rows($result) == 0)
        {
            $sql = "INSERT INTO `user`(`icon`, `name`, `account`, `password`) VALUES ('".$icon."','".$name."','".$account."','".$password."')";
            $result = mysqli_query($con, $sql);
            if($result == 1)
            {
                $data["result"] = "true";
            }
            else
            {
                $data["result"] = "false";
                $data["error"] = "Sign up failed. Please try again!";
            }
        }
        else
        {
            $data["result"] = "false";
            $data["error"] = "Account has been used.";
        }
        return json_encode($data, JSON_UNESCAPED_UNICODE);
    }

    function Creat_room_table($con)
    {
        /*
        * getRandomKey and check key if not exist in database table
        */
        $roomkey = null;
        while(1){
            $roomkey = getRandomKey(5);
            $sql = "SHOW TABLES LIKE 'room_". $roomkey ."'";
            $result = mysqli_query($con, $sql);
            if(mysqli_num_rows($result) == 0)
                break;
        }
        /*
        * creat room table 
        * account VARCHAR(12)
        * name VARCHAR(12)
        * icon VARCHAR(12)
        * lat FLOAT(40)
        * lng FLOAT(40)
        */
        $sql = "CREATE TABLE room_". $roomkey ."(account VARCHAR(12),name VARCHAR(12),icon VARCHAR(12),lat FLOAT(40),lng FLOAT(40))";
        $result = mysqli_query($con, $sql);
        if($result == 1)
        {
            $data["result"] = "true";
            $data["key"] = $roomkey;
        }
        else
        {
            $data["result"] = "false";
            $data["error"] = "Creat Room failed. Please try again!";
        }
        return json_encode($data, JSON_UNESCAPED_UNICODE);
    }

    function Enter_room($con,$icon,$name,$account,$lat,$lng,$roomkey)
    {
        /*
        * check room_+key table if exist
        */
        $sql = "SHOW TABLES LIKE 'room_". $roomkey ."'";
        $result = mysqli_query($con, $sql);
        if(mysqli_num_rows($result) == 1)
        {
            /*
            * check user has been already enter room_+key, using insert or update data to the room_key table.
            */
            $sql = "SELECT * FROM room_". $roomkey ." WHERE account = '".$account."'";
            $result = mysqli_query($con, $sql);
            if(mysqli_num_rows($result) == 1)
            {
                $sql = "UPDATE `room_". $roomkey ."` SET `account`='".$account."',`name`='".$name."',`icon`='".$icon."',`lat`=".$lat.",`lng`=".$lng." WHERE account = '". $account ."'";
            }
            else
            {
                /*
                * update user table for user's room column
                */
                $sql = "UPDATE `user` SET `room`='". $roomkey ."' WHERE account = '".$account."'";
                $result = mysqli_query($con, $sql);
                if($result == 1)
                {
                    $sql = "INSERT INTO room_". $roomkey ."(`account`, `name`, `icon`,`lat`, `lng`) VALUES ('".$account."','".$name."','".$icon."',". $lat .",". $lng .")";
                }
                else
                {
                    $data["result"] = "false";
                    $data["error"] = "Something was wrong. Please try again!";
                }
            }
            $result = mysqli_query($con, $sql);
            if($result == 1)
            {
                $data["result"] = "true";
            }
            else
            {
                $data["result"] = "false";
                $data["error"] = "Enter room failed. Please try again!";
            }
        }
        else
        {
            $data["result"] = "false";
            $data["error"] = "The Room '". $roomkey ."' has not found.";
        }
        return json_encode($data, JSON_UNESCAPED_UNICODE);
    }

    function Read_room($con,$roomkey)
    {
        /*
        * check room_+key table if exist
        */
        $sql = "SHOW TABLES LIKE 'room_". $roomkey ."'";
        $result = mysqli_query($con, $sql);
        if(mysqli_num_rows($result) == 1)
        {
            /*
            * get room_+key table data that member's data
            */
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
        }
        else
        {
            $data["result"] = "false";
            $data["error"] = "Room is not exist";
        }
        return json_encode($data, JSON_UNESCAPED_UNICODE);
    }

    function Leave_room($con,$account,$roomkey)
    {
        /*
        * update user table for user's room column
        */
        $sql = "UPDATE `user` SET `room`= null WHERE account = '".$account."'";
        $result = mysqli_query($con, $sql);
        /*
        * update room_+key table that remove the $account data
        */
        $sql = "DELETE FROM room_". $roomkey ." WHERE account = '".$account."'";
        $result = mysqli_query($con, $sql);
        /*
        * if room_+key table member number = 0, that delete table
        */
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

    function search_table_exist($table_name)
    {
        $sql = "SHOW TABLES LIKE '". $table_name ."'";
        return mysqli_query($con, $sql);
    }