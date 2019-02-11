# -*- mode: ruby -*-
# vi: set ft=ruby :
Vagrant.configure("2") do |config|
  config.vm.box = "debian/jessie64"  
  config.vm.box_check_update = false
  config.vm.network "forwarded_port", guest: 3001, host: 8080


  
  # config.vm.network "private_network", ip: "192.168.33.10"
  # config.vm.network "public_network"
  # config.vm.synced_folder ".", "/vagrant_data"

  # config.vm.provider "virtualbox" do |vb|
  #   # Display the VirtualBox GUI when booting the machine
  #   vb.gui = true
  #
  #   # Customize the amount of memory on the VM:
  #   vb.memory = "1024"
  # end

  
  # Enable provisioning with a shell script. Additional provisioners such as
  # Puppet, Chef, Ansible, Salt, and Docker are also available. Please see the
  # documentation for more information about their specific syntax and use.
  # config.vm.provision "shell", path: "https://gist.githubusercontent.com/devprashant/73d46863378c7c2f8952719660d4b9be/raw/a7637a116f341441bfcf6881a71385ba8c54ef37/bootstrap_couchdb.sh"
  config.vm.provision "shell", path: "bootstrap.sh", privileged: false
end