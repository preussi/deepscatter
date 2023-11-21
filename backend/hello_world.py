from pymilvus import connections

connections.connect(
  alias="default",
  user='username',
  password='password',
  host='localhost',
  port='19530'
)

print("hello world")