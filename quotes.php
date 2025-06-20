<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

// Используем правильные параметры подключения из вашей БД
$conn = new mysqli("127.0.0.1", "baza", "1234", "baza_voprosov");

if ($conn->connect_error) {
    die(json_encode([
        "error" => "Connection failed",
        "message" => $conn->connect_error,
        "details" => "Check database credentials"
    ]));
}

if (isset($_GET['action'])) {
    try {
        switch ($_GET['action']) {
            case 'get_authors':
                $result = $conn->query("SELECT id, name FROM authors");
                if (!$result) {
                    throw new Exception($conn->error);
                }
                $authors = $result->fetch_all(MYSQLI_ASSOC);
                echo json_encode($authors);
                break;
                
            case 'get_works':
                $author_id = (int)$_GET['author_id'];
                $stmt = $conn->prepare("SELECT id, title FROM works WHERE author_id = ?");
                $stmt->bind_param("i", $author_id);
                $stmt->execute();
                $result = $stmt->get_result();
                echo json_encode($result->fetch_all(MYSQLI_ASSOC));
                break;
                
          case 'get_quote':
    $author_id = isset($_GET['author_id']) ? (int)$_GET['author_id'] : 0;
    $work_id = isset($_GET['work_id']) ? (int)$_GET['work_id'] : 0;
    
    if ($work_id > 0) {
        $stmt = $conn->prepare("SELECT q.text, w.title, a.name as author_name 
                               FROM quotes q 
                               JOIN works w ON q.work_id = w.id 
                               JOIN authors a ON w.author_id = a.id
                               WHERE q.work_id = ? 
                               ORDER BY RAND() LIMIT 1");
        $stmt->bind_param("i", $work_id);
    } elseif ($author_id > 0) {
        $stmt = $conn->prepare("SELECT q.text, w.title, a.name as author_name 
                              FROM quotes q 
                              JOIN works w ON q.work_id = w.id 
                              JOIN authors a ON w.author_id = a.id
                              WHERE w.author_id = ? 
                              ORDER BY RAND() LIMIT 1");
        $stmt->bind_param("i", $author_id);
    } else {
        $stmt = $conn->prepare("SELECT q.text, w.title, a.name as author_name 
                              FROM quotes q 
                              JOIN works w ON q.work_id = w.id 
                              JOIN authors a ON w.author_id = a.id
                              ORDER BY RAND() LIMIT 1");
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    echo json_encode($result->fetch_assoc());
    break;
                
            default:
                echo json_encode(["error" => "Invalid action"]);
        }
    } catch (Exception $e) {
        echo json_encode(["error" => $e->getMessage()]);
    }
} else {
    echo json_encode(["error" => "No action specified"]);
}

$conn->close();
?>