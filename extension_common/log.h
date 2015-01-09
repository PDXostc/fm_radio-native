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

#include <syslog.h>

#define LOGD(fmt,arg...)  syslog(LOG_USER | LOG_DEBUG, fmt, ##arg);
#define LOGE(fmt,arg...)  syslog(LOG_USER | LOG_ERR, fmt, ##arg);
