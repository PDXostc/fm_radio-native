
#include "wkb-config-client.h"

#include <stdlib.h>
#include <unistd.h>
#include <limits.h>
#include <algorithm>
#include <vector>
#include <iostream>
#include <string>

//#include "gtest/gtest.h"


using namespace std;

void
basic_test()
{
    try
    { 
        std::string theme;

        WeekeyboardConfigClient client;
        client.Init();

        theme = "/usr/share/weekeyboard/test_600.edj";
        cout << "Setting theme: " << theme << endl;

        client.SetTheme(theme);

        cout << "Waiting 5 seconds - check the keyboard.\n";
        for (int i = 0 ; i < 5 ; i++)
        {
            sleep(1); cout << "."; cout.flush();
        }
        cout << endl;
        
        theme = "/usr/share/weekeyboard/test_720.edj";
        cout << "Setting theme: " << theme << endl;
        client.SetTheme(theme);
        
        cout << "Success!" << endl;
    }
    catch(std::exception& e)
    {
        cout << "FAIL: Exception thrown: " << e.what() << endl;
    }
}

void
test(std::string theme)
{
    try
    { 
        WeekeyboardConfigClient client;
        client.Init();

        cout << "Setting theme: " << theme << endl;

        client.SetTheme(theme);

        cout << "Success!" << endl;
    }
    catch(std::exception& e)
    {
        cout << "FAIL: Exception thrown: " << e.what() << endl;
    }
}


int main(int argc, char* argv[])
{
    if (argc == 1)
    {
        basic_test();
        return 0;
    }

    test(argv[1]);

    return 0;
}
       
