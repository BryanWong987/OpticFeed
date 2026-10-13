# OpticFeed


## Running the Project
This project requires:
- Node.js (version 22+)
- WSL with an Ubuntu instance, if your machine is on Windows (only if deploying on EC2). This is used for recognizing rsync in deploy.sh.
### Running Locally (localhost)
1. Clone this repository on your machine
2. Open a terminal (WSL or Git Bash for Windows) and navigate to this project directory
2. Run this project by calling the script:
```
./start.sh
```
4. Navigate to http://localhost:3000 on a browser.

See start.sh for a list of optional parameters, such as setting the port number.

### Running with Amazon EC2 instance
1. Clone this repository on your machine
2. Copy the deploy folder in the project directory to your EC2 instance using your EC2 key:
```
scp -i ~/(path to key)/mykey.pem -r deploy ubuntu@<PUBLIC-IP>:~
```
3. SSH into your EC2 instance in a terminal with
```
ssh -i ~/(path to key)/mykey.pem ubuntu@<PUBLIC-IP>
```
4. Run the EC2 setup script on your EC2 instance terminal:
```
sudo bash deploy/setup-ec2.sh
```
5. Run deploy.sh on your local machine (using WSL if on Windows) with the command:
```
./deploy/deploy.sh -h <PUBLIC-IP> -i ~/(path to key)/mykey.pem
```
6. Navigate to your public IP website to view the project.