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
#include "wkb-ibus-defs.h"

#include <Eldbus.h>
#include <Ecore.h>
#include <Ecore_Evas.h>
#include <string>
#include <exception>
#include <sstream>

#include <glib.h>
#include <unistd.h>
#include <syslog.h>
#include <pthread.h>



#define FIRST(...) FIRST_HELPER(__VA_ARGS__, throwaway)
#define FIRST_HELPER(first, ...) first

#define REST(...) REST_HELPER(NUM(__VA_ARGS__), __VA_ARGS__)
#define REST_HELPER(qty, ...) REST_HELPER2(qty, __VA_ARGS__)
#define REST_HELPER2(qty, ...) REST_HELPER_##qty(__VA_ARGS__)
#define REST_HELPER_ONE(first)
#define REST_HELPER_TWOORMORE(first, ...) , __VA_ARGS__
#define NUM(...) \
    SELECT_10TH(__VA_ARGS__, TWOORMORE, TWOORMORE, TWOORMORE, TWOORMORE,\
                TWOORMORE, TWOORMORE, TWOORMORE, TWOORMORE, ONE, throwaway)
#define SELECT_10TH(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, ...) a10

#define DBG(...)      {                                                 \
        char _sz[4096];                                                 \
        sprintf(_sz, "RE: wkb_client - " FIRST(__VA_ARGS__) "\n" REST(__VA_ARGS__)); \
        syslog(LOG_USER | LOG_DEBUG, _sz);                              \
    }
#define DBG_INIT() /* */

/*
FILE* _log_fp;


#define DBG(...)      {                                                 \
        char _sz[4096];                                                 \
        sprintf(_sz, "RE: wkb_client - " FIRST(__VA_ARGS__) "\n" REST(__VA_ARGS__)); \
        fprintf(_log_fp, "%s", _sz);                                    \
        fflush(_log_fp);                                                \
        syslog(LOG_USER | LOG_DEBUG, _sz);                              \
        printf("%s", _sz); fflush(stdout);                              \
    }

#define DBG_INIT() {                                    \
        _log_fp = fopen("/home/app/wkb_client", "a+");  \
        fprintf(_log_fp, "##############################################\n"); \
    }

*/


class wkb_client_exception : public std::exception
{
public:
    wkb_client_exception(std::string what_in) : std::exception(), _what(what_in)
        {
            std::stringstream ss;

            ss << "wkb_client - exception: " << what();
            syslog(LOG_USER | LOG_ERR, ss.str().c_str());
            
            DBG("exception: %s", what());
        }
    virtual const char* what() const throw() { return _what.c_str(); }

private:
    std::string _what;
};


WeekeyboardConfigClient::WeekeyboardConfigClient()
    : log_domain(-1),
      conn(NULL),
      obj(NULL),
      proxy(NULL),
      g_thread(),
      ecore_thread(),
      initstate(none)
      
{
    tmp_address[0] = '\0';

    DBG_INIT();

}

WeekeyboardConfigClient::~WeekeyboardConfigClient()
{
    if (initstate != none)
    {
        Cleanup();
    }
}

void
WeekeyboardConfigClient::Cleanup()
{
    switch (initstate)
    {
        case all:
            DBG("cleanup - all.");
            initstate = connected;
            
        case connected:
            DBG("cleanup - connected.");
            if (conn) eldbus_connection_unref(conn);

            initstate = eldbus;
        case eldbus:
            DBG("cleanup - eldbus.");
            eldbus_shutdown();
            
            initstate = ecore;
        case ecore:
            DBG("cleanup - ecore.");
            ecore_shutdown();

            initstate = eina;
        case eina:
            DBG("cleanup - eina.");
            if (log_domain >= 0) eina_log_domain_unregister(log_domain);
            eina_shutdown();
            
            initstate = none;
        case none:
            ;
    }
    
    initstate = none;
}


/* Setup the IBus connection to the weekeyboard client.
 */
void
WeekeyboardConfigClient::Init()
{
    DBG("Init.");
 
    if (initstate != none)
    {
        return ;
    }

    /////////////////// eina /////////////////////////////////////////////////////
    if (eina_init() <= 0)
    {
        throw  wkb_client_exception("Unable to init eina");
    }   
    syslog(LOG_USER | LOG_DEBUG, "wkb_client - eina_init.");

    log_domain = eina_log_domain_register("wkb_client", EINA_COLOR_CYAN);
    if (log_domain < 0)
    {
        throw wkb_client_exception("Unable to create 'client' log domain");
    }
    DBG("eina_log_domain_register.");

    /////////////////// ecore ////////////////////////////////////////////////////
    int rval;
    if ((rval = ecore_init()) <= 0)
    {
        throw wkb_client_exception("Unable to initialize ecore");
    }
    DBG("ecore_init rval = %d", rval);
    
    // xw uses glib - call this to integrate with it properly
    Eina_Bool haveglib = ecore_main_loop_glib_integrate();
    DBG("ecore_main_loop_glib_integrate - %s", haveglib ? "true" : "false");
        
    initstate = ecore;

    /////////////////// eldbus //////////////////////////////////////////////////
    if (eldbus_init() <= 0)
    {
        throw wkb_client_exception("Unable to initialize eldbus");
    }
    DBG("eldbus_init.");
    initstate = eldbus;
    
    /////////////////// ibus address //////////////////////////////////////////////////

    // get the connection address. Yes, it only comes from a command line application
    FILE* fp = popen("ibus address", "r");
    if (! fp)
    {
        throw wkb_client_exception("Unable to find ibus address");
    }
   
    if (! fgets(tmp_address, 4096 - 1, fp))
    {
        throw wkb_client_exception("Unable to find ibus address");
    }
    // and strip out the newline at the end
    int end = strlen(tmp_address) - 1;
    if (end < 0)
    {
        end = 0;
        throw wkb_client_exception("Cannot find the ibus address");
    }
    tmp_address[strlen(tmp_address) - 1] = '\0';
    pclose (fp);
    DBG("ibus address = %s", tmp_address);
    
    /////////////////// eldbus - connection //////////////////////////////////////////////////
    conn = eldbus_address_connection_get(tmp_address);
    if (! conn)
    {
        throw wkb_client_exception("Cannot establish eldbus connection");
    }
    DBG("eldbus_address_connection_get.");

    initstate = connected;    
    
    obj = eldbus_object_get(conn, IBUS_SERVICE_CONFIG, IBUS_PATH_CONFIG);
    if (! obj)
    {
        throw wkb_client_exception("Cannot create eldbus object");
    }
    DBG("eldbus_object_get");
    
    proxy = eldbus_proxy_get(obj, IBUS_INTERFACE_CONFIG);
    if (! proxy)
    {
        eldbus_object_unref(obj);                       
        throw wkb_client_exception("Cannot create eldbus proxy");
    }
    DBG("eldbus_proxy_get");

    initstate = all;
}


/* Send the SetTheme command to the weekeyboard client
 */
void
WeekeyboardConfigClient::SetTheme(std::string theme)
{
    DBG("set theme.");
    
    if (initstate != all)
    {
        throw wkb_client_exception("Weekeyboard Client is not initialized in SetTheme");
    }

    // form the message for the SetValue call
    Eldbus_Message* msg;
    msg = eldbus_proxy_method_call_new(proxy, "SetValue");

    // add the first two strings - section and name of the setting
    Eldbus_Message_Iter* iter = eldbus_message_iter_get(msg);
    eldbus_message_iter_arguments_append(iter, "ss", "panel", "theme");

    // add the value of the setting as a variant
    Eldbus_Message_Iter* variant = eldbus_message_iter_container_new(iter, 'v', "s");
    eldbus_message_iter_basic_append(variant, 's', theme.c_str());
    eldbus_message_iter_container_close(iter, variant);
    
    eldbus_proxy_send(proxy, msg, NULL, NULL, -1);
    
    DBG("set theme - done");
}

