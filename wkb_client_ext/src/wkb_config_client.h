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

/* Rob Erickson (rerickso@jaguarlandrover.com)
 *
 * Intererface to submit configuration changes to a Weekeyboard
 * daemon.
 */

#ifndef WEEKEYBOARD_CONFIG_CLIENT_H
#define WEEKEYBOARD_CONFIG_CLIENT_H

#include <string>
#include <stdio.h>
#include <unistd.h>

struct _Eldbus_Connection;
typedef _Eldbus_Connection Eldbus_Connection;
struct _Eldbus_Object;
typedef _Eldbus_Object Eldbus_Object;
struct _Eldbus_Proxy;
typedef _Eldbus_Proxy Eldbus_Proxy;


class WeekeyboardConfigClient
{
  public:
    WeekeyboardConfigClient();
    ~WeekeyboardConfigClient();
    
    void Init();
    void Cleanup();
    void SetTheme(std::string theme);
    
  private:

    char tmp_address[4096];
    int log_domain;
    Eldbus_Connection* conn;
    Eldbus_Object* obj;
    Eldbus_Proxy* proxy;
    
    pthread_t g_thread;
    pthread_t ecore_thread;
    
    enum init_e
    {
        none, eina, ecore, eldbus, connected, all
    };
    init_e initstate;

};

#endif
