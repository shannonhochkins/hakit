## HAKIT Dashboard

This addon simply serves your custom dashboard to a new sidebar link in home assistant making it easier to access your custom dashboard.

This (over time) will evolve into a much more complicated addon where users will be able to design & build dashboards as well as download / upload custom templates from the community or create their own.


### Local Development
After `npm install`, Simply run `npm run dev` and it will spin up a server and client under port 2022.

#### Options
To get this to work locally, create an options.json file under the server directory with the following contents:
```
{
  "html_file_path": "www/ha-dashboard/index.html",
  "spa_mode": true
}
```
This will You will also need to create a "config" directory under the root of this project containing the file path of the `html_file_path` option above.

```
server
   - options.json
config
   - www
       - ha-dashboard
           - index.html
```

