create table Users(

   User_Id varchar(30) not null unique primary key,
   Name varchar(30) not null,
   Surname varchar(30) not null,
   Gender char not null,
   Birthdate date not null,
   Points int,
   Password varchar(64) not null
  
    
	
);

create table Skills(

  Skill_ID serial not null unique primary key,
  Skill_Name varchar(120) not null

	
);

create table Follows(

  Follower_ID varchar(30) not null, 
  Followed_ID varchar(30) not null,
  Foreign Key(Follower_ID) references Users(User_Id) on delete cascade on update cascade,
  Foreign Key(Followed_ID) references Users(User_Id) on delete cascade on update cascade

	
);

create table Has(

  User_ID varchar(30) not null, 
  Skill_ID int not null,
  Foreign Key(User_ID) references Users(User_Id) on delete cascade on update cascade,
  Foreign Key(Skill_ID) references Skills(Skill_ID) on delete cascade on update cascade

	
);

create table Needs(

  User_ID varchar(30) not null, 
  Skill_ID int not null,
  Foreign Key(User_ID) references Users(User_Id) on delete cascade on update cascade,
  Foreign Key(Skill_ID) references Skills(Skill_ID) on delete cascade on update cascade

	
);

create table Texts(
 
  From_ID varchar(30) not null,
  To_ID varchar(30) not null,
  Date date not null,
  Message text not null,
  Foreign Key(From_ID) references Users(User_Id) on delete cascade on update cascade,
  Foreign Key(To_ID) references Users(User_Id) on delete cascade on update cascade
  


	
);

create table Exchanges(

	User1_Id varchar(30) not null,
	Skill1_Id int not null,
	User2_Id varchar(30) not null,
	Skill2_Id int not null,
	Start_Date date not null,
	End_Date date not null,
	Foreign Key(User1_Id) references Users(User_Id) on delete cascade on update cascade,
    Foreign Key(Skill1_Id) references Skills(Skill_ID) on delete cascade on update cascade,
	Foreign Key(User2_Id) references Users(User_Id) on delete cascade on update cascade,
    Foreign Key(Skill2_Id) references Skills(Skill_ID) on delete cascade on update cascade

);

create table Teaches(

	Teacher_Id varchar(30) not null,
	Student_Id varchar(30) not null,
	Skill_ID int not null,
	Start_Date date not null,
	End_Date date not null,
	Foreign Key(Teacher_Id) references Users(User_Id) on delete cascade on update cascade,
    Foreign Key(Student_Id) references Users(User_Id) on delete cascade on update cascade,
	Foreign Key(Skill_ID) references Skills(Skill_ID) on delete cascade on update cascade

	
);


create or replace function get_user_skills (
  id varchar
)
returns table (
  Skill_ID int,
	Skill_Name varchar(120)
)
language plpgsql
as $$
begin
	return query
	   SELECT s.Skill_ID , s.Skill_Name
    FROM Has h
    JOIN Skills s ON h.Skill_ID = s.Skill_ID
    WHERE h.User_ID = id;
end;
$$;


create or replace function get_user_skills_needs (
  id varchar
)
returns table (
  Skill_ID int,
	Skill_Name varchar(120)
)
language plpgsql
as $$
begin
	return query
	   SELECT s.Skill_ID , s.Skill_Name
    FROM Needs n
    JOIN Skills s ON n.Skill_ID = s.Skill_ID
    WHERE n.User_ID = id;
end;
$$;

create or replace function get_followers (
  id varchar
)
returns table (
	User_ID varchar(30)
)
language plpgsql
as $$
begin
	return query
	   SELECT f.Follower_ID
    FROM Follows f
    WHERE f.Followed_ID= id;
end;
$$;

create or replace function get_followings (
  id varchar
)
returns table (
	User_ID varchar(30)
)
language plpgsql
as $$
begin
	return query
	   SELECT f.Followed_ID
    FROM Follows f
    WHERE f.Follower_ID= id;
end;
$$;


create or replace function getSearchResultsByCount (
  id varchar,
  skill_id_ int 
)
returns table (
	User_ID varchar(30)
)
language plpgsql
as $$
begin
	return query
    select n.user_id
    from needs n
    where n.user_id in(select h.user_id
    from has h
    where h.skill_id=skill_id_) and n.skill_id in (select h.skill_id 
	                               from has h
	                               where h.user_id=id)
    group by n.user_id
    order by count(n.user_id) desc;
end;
$$;

create or replace function getSearchResultsByPoints (
  id varchar,
  skill_id_ int 
)
returns table (
	User_ID varchar(30)
)
language plpgsql
as $$
begin
	return query
	select u.user_id from users u where u.user_id in(
	  select n.user_id
      from needs n
      where n.user_id in(select h.user_id
         from has h
         where h.skill_id=skill_id_) and n.skill_id in (select h.skill_id 
	                               from has h
	                               where h.user_id=id)
	
    )
    order by u.points desc;
end;
$$;
