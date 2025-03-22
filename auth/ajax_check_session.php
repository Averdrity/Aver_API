<?php
// File: /auth/ajax_check_session.php

session_start();
header("Content-Type: application/json");

if (isset($_SESSION['user_id']) && isset($_SESSION['username'])) {
    echo json_encode([
        "logged_in" => true,
        "user_id"   => $_SESSION['user_id'],
        "username"  => $_SESSION['username']
    ]);
} else {
    echo json_encode(["logged_in" => false]);
}

