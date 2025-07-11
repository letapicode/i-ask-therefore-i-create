// Sample schema for a simple social graph
CREATE CONSTRAINT user_pk IF NOT EXISTS
FOR (u:User)
REQUIRE u.id IS UNIQUE;

CREATE CONSTRAINT post_pk IF NOT EXISTS
FOR (p:Post)
REQUIRE p.id IS UNIQUE;
