export const email_template =`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <link rel="stylesheet" href="style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
    <link href='https://cdn.boxicons.com/fonts/transformations.min.css' rel='stylesheet'>
    <style>

body {
    font-family: 'Poppins', sans-serif;
    background-color: #f4f7f6;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    margin: 0;
    color: #333;
}


.container {
    background-color: #ffffff;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    text-align: center;
    max-width: 450px;
    width: 100%;
}

.icon-wrapper {
    width: 80px;
    height: 80px;
    background-color: #00A9B5;
    border-radius: 50%;
    margin: 0 auto 25px auto;
    display: flex;
    justify-content: center;
    align-items: center;
}

.icon-wrapper svg {
    stroke: #ffffffff;
    width: 40px;
    height: 40px;
}

h1 {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 15px;
    color: #2c3e50;
}

.info-text {
    font-size: 16px;
    color: #555;
    line-height: 1.6;
    margin: 0 auto 10px auto;
    max-width: 380px;
}

.info-text .strong {
    color: #333;
    font-weight: 500;
}

.info-text.small {
    font-size: 14px;
    color: #777;
    margin-bottom: 30px;
}



.verification-code {
    display: block;
    margin: 10px 0;
    font-size: 22px;
    color: #00A9B5;
    border: 1px dashed #00A9B5;
    padding: 10px;
    text-align: center;
    border-radius: 5px;
    font-weight: 700;
    letter-spacing: 2px;
}

    </style>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
</head>
<body>

    <div class="container">
        <div class="icon-wrapper">
            <i class="fa fa-envelope" style="font-size:48px;color:rgb(255, 255, 255)"></i>
        </div>
        
        <h1>Verify Your Email Address</h1>
        
        
        <p class="info-text small">
          Here is your verification code from <span class="strong">ArgusCode</span> to verify your email address.
        </p>
        <span class="verification-code">{verificationCode}</span>


    </div>
</body>
</html>`