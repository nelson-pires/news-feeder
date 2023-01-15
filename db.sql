
create database news_feeder

create table imports (
id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
importDate DATETIME,
rawContent TEXT
) engine=MyISAM

drop table imports
truncate table imports
select * from imports

insert into imports (importDate, rawContent) 
values ('2023-01-13', 'raw');

create table articles (
id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
externalId VARCHAR(500),
importDate DATETIME,
title TEXT,
publicationDate DATETIME,
description TEXT,
link TEXT,
mainPicture TEXT
) engine=MyISAM

alter table articles add unique (externalId(255))

drop table articles
truncate table articles
select * from articles

replace into articles (externalId, importDate, title, publicationDate, description, link, mainPicture) 
values ('eid', '2023-01-12', 'tit', '2023-01-12', 'desc', 'link', 'pic');

replace into articles (externalId, importDate, title, publicationDate, description, link, mainPicture) 
values ('eid2', '2023-01-13', 'tit2', '2023-01-13', 'desc2', 'link2', 'pic2');

replace into articles (externalId, importDate, title, publicationDate, description, link, mainPicture) 
values ('eid', '2023-01-13', 'tit1', '2023-01-13', 'desc1', 'link1', 'pic1');

insert into articles (externalId, importDate, title, publicationDate, description, link, mainPicture)
values ('eid', '2023-01-11', 'tit0', '2023-01-11', 'desc0', 'link0', 'pic0')
on duplicate key update importDate = '2023-01-11', title = 'tit0', publicationDate = '2023-01-11', description = 'desc0', link = 'link0', mainPicture = 'pic0';
