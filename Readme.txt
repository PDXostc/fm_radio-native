Following are the recommended steps for building and installing "DNA_FMRadio" with
the FMRadioExtension extension, FMRadioService dbus daemon and running all of it on target device.

Build environment: Tested on Ubuntu 14.10

The .gbs.conf file in your home directory must contain this line in the [repo.tizen_latest] heading:
url = http://download.tizen.org/releases/milestone/tizen/ivi/tizen_20140422.1/repos/ivi/ia32/packages

An example .gbs-conf file is in this project's root directory.



STEPS TO BUILD AND RUN
*************************************
In an Ubuntu shell:

*** on HOST SYSTEM ***

        $ cd <X004_FMRadio git repo>

  * Tell the system where is your target device
        $ export TIZEN_IP=<YOUR_TARGET_IP_ADRESS>

  * Build the extensions, the service and its tarballed external dependencies

        $ gbs build --include-all --spec agl_plugin_suite.spec -A i586

  * Copy the rpms to your target system's

            # In the following, to avoid typing a password for each scp or ssh command you need to copy
            # your public key over
            #
            # $ ssh-copy-id app@$TIZEN_IP
            #
            # This command will require your password and then you will be able to
            # use ssh and scp without a password from that user.

        $ sh ./cp_rpms.sh

                # Additionally, if you want to ALSO copy the 'debug' rpms, do this INSTEAD :
                  $ ./cp_rpms.sh debug

          ## You will notice that the script also copies the "install_rpms.sh" script over.

  * Make sure your FM radio dongle is up and running
        * For example, when using the R820T SDR&DVB-T from NooElec, do :

        $ sudo cp blacklist-rtlsdr.conf /etc/modprobe.d
        $ sudo cp 99-librtlsdr.rules /etc/udev/rules.d

  * Reboot your target device

        $ sudo reboot


*** on TARGET DEVICE ***

  * Install the copied rpms

        $ cd ~/
        $ sudo ./install_rpms.sh

            # If the package is installed for the first time, you'll get error messages about
            # not being able to 'un'install, but just ignore those messages

                    # Additionally, if you want to ALSO copy the 'debug' rpms, do this INSTEAD :
                    $ sudo ./install_rpms.sh debug


*** back on HOST SYSTEM ***

  * Build and run the DNA applications

        $ cd <X004_FMRadio git repo>
        ** please note this is the ROOT X004_FMRadio folder.

        $ make install

        $ make run

            # Notice that for now, make run IS NECESSARY for the whole thing to work
            # since it adds the pulseaudio 'tmp' folder manually : $ mkdir -p /tmp/pulseaudio
            # So do not run the .wgt application from tizen console just yet.

   * Enjoy!
