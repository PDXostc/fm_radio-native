Following are the recommended steps for building and installing "Hello Tizen IVI",
with the extension, and running it.

Build environment: Linux; Ubuntu 3.8 works well.

The .gbs.conf file in your home directory must contain this line in the [repo.tizen_latest] heading:
url = http://download.tizen.org/releases/milestone/tizen/ivi/tizen_20140422.1/repos/ivi/ia32/packages

In an Ubuntu shell:
  *   unzip AGL_Example_6Jan2015.zip
  *   cd AGL_Example
  *   git init

  *   Build the sample extension

      For more information developing for tizen (including the gbs tool) check 
      out https://source.tizen.org/documentation/developer-guide

      -   gbs build --include-all --spec agl_plugin_suite.spec -A i586
      -   Copy the agl_plugin_suite-0.0.1-1.i686.rpm from ~/GBS-ROOT/local/repos/tizen/i586/RPMS to the target system.
      -   On the target system, in the folder to which you copied the agl_plugin_suite-0.0.1-1.i686.rpm, run:
            (as root)
      
            rpm -ivh agl_plugin_suite-0.0.1-1.i686.rpm


          If a version already exists, remove it with:
            rpm -e agl_plugin_suite-0.0.1-1.i686

  *   To build the sample applications, DNA_HelloTizen and DNA_HomeScreen
	-   cd to the application directory (DNA_HelloTizen or DNA_HomeScreen)
  	-   Edit Makefile, replacing the address in the TIZEN_IP= line with the IP address of the target system.
  	-   make install

        The Makefile has these avalable targets:

            app:       creates the widget (.wgt) file
            deploy:    creates the widget, and copies it to the target
            install:   creates the widget, copies it, removes any current installation, and installs the new version

On the target system:
  *  su - app
  *  xwalkctl -i DNA_HomeScreen.wgt
  *  xwalkctl -i DNA_HelloTizen.wgt
  *  xwalk-launcher JLRPOCX000.HelloTizen

You should now see the HelloTizenIVICrosswalk running on the target platform.

For more information on xwalkctl and Crosswalk applications, check out crosswalk-project.org. In
particular these commands are useful:

    xwalkctl                 - lists the installed applicaitons
    xwalkctl -u <app name>   - uninstalls an application
    xwalkctl -i <wgt file>   - installs the widget

    xwalk-launcher -d <app name>   - runs the application in debug mode (use chrome to browse to 
            <ip of target>:9888 for debugging)

To test the HelloTizenIVI Crosswalk extension:
  *   On the target platform, stream logger output via: journalctl -f -l 
  *   In the HelloTizenIVICrosswalk application, enter a title and description, then press Add Item
  *   In the log output, look for the string: "bp callback js: Async>>> Last title received:"
  *   This string should contain the title data for the item you added.

To see the DNA HomeScreen, run:
	xwalk-launcher JLRPOCX001.HomeScreen

Hello Tizen IVI contains the following code snippets:

    At the top:
    Sample page title, subtitle, description, right aligned toggle button 

    Next is an input form, where items can be added with a title and description.

    Below that is an output table where the items that are input are printed. The output is templated for delivery.

    Following that is a centered button sample.

    After that the there is a commented out sample form with a simple text area, no javascript.

    Then a form with label classes and typography samples, and a submit button.

    After that is an overlay for a warning modal, then the modal div wrapped around the modal form.


Source tree structuring:
Additional code that is not part of the Crosswalk extension you are developing should be put into a separate, peer folder.
For example: if you are developing both a Crosswalk extension and a daemon for the XYZ capability, then you should
put the extension code into a XYZExtension folder, and a XYZServices folder, both peers of each other.
