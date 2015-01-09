/* Copyright (C) 2014 Jaguar Land Rover - All Rights Reserved
*
* Proprietary and confidential
* Unauthorized copying of this file, via any medium, is strictly prohibited
*
* THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY 
* KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
* IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
* PARTICULAR PURPOSE.
*
*/


#include "wkb_config_client.h"

#include <stdlib.h>
#include <iostream>
#include <string>

using namespace std;

void
test(std::string theme)
{
    try
    { 
        WeekeyboardConfigClient client;
        client.Init();

        cout << "Setting theme: " << theme << endl;

        client.SetTheme(theme);
    }
    catch(std::exception& e)
    {
        cout << "FAIL: Exception thrown: " << e.what() << endl;
    }
}


int main(int argc, char* argv[])
{
    if (argc <= 1)
    {
        cerr << "Usage: " << argv[0] << " <absolute path to theme>" << endl;
    }

    test(argv[1]);

    return 0;
}
       
