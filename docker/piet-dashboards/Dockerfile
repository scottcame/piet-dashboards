# Copyright 2020 Scott Came Consulting LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# docker build -t scottcame/piet-dashboards .
# docker run -d -p 8080:8080 --name piet-dashboards scottcame/piet-dashboards

FROM tomcat:9.0-jdk8

ENV JAVA_OPTS="-Xms1024M -Xmx2048M"

COPY server.xml /usr/local/tomcat/conf/

RUN mkdir -p /opt/tomcat/shared/config/

COPY catalina.properties /usr/local/tomcat/conf/

RUN cd /tmp && \
  curl -o mondrian-rest.war https://repo1.maven.org/maven2/org/ojbc/mondrian-rest/2.0.6/mondrian-rest-2.0.6.war && \
  mv mondrian-rest.war /usr/local/tomcat/webapps/

COPY application.properties /usr/local/tomcat/shared/config/
COPY piet-dashboards-config.json /usr/local/tomcat/shared/
COPY piet-dashboards.war /usr/local/tomcat/webapps/
