#Invoke-WebRequest https://the-greenman.github.io/lego/setup.bat -OutFile setup.bat


Set-ExecutionPolicy AllSigned
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

choco install firefox -y
choco install setuserfta -y

#set default browser

SetuserFTA http FirefoxHTML
SetuserFTA https FirefoxHTML
SetuserFTA .htm FirefoxHTML
SetuserFTA .html FirefoxHTML


Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\PasswordLess\Device" -Name "DevicePasswordLessBuildVersion" -Value 0 -Type Dword -Force

$Username ='default'
$Pass = 'default'
$RegistryPath = 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon'
Set-ItemProperty $RegistryPath 'AutoAdminLogon' -Value "1" -Type String
Set-ItemProperty $RegistryPath 'DefaultUsername' -Value $Username -type String
Set-ItemProperty $RegistryPath 'DefaultPassword' -Value $Pass -type String


# Manually install 
#  https://addons.mozilla.org/en-US/firefox/addon/autofullscreen/

# Open firefox to url: https://the-greenman.github.io/lego?feed=0
# add shortcut to startup folder
# Win+R shell:startup








