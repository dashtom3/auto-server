##用户接口
###注册(post)
[http://localhost:3300/user/signup?name=zzz&nikeName=joseph&password=123&mail=qq.com&phone=123&idImg1=xxx&idImg2=yyy&userType=no](http://localhost:3300/user/signup?name=zzz&nikeName=joseph&password=123&mail=qq.com&phone=123&idImg1=xxx&idImg2=yyy&userType=no)

###登录
[http://localhost:3300/user/login?name=aaa&password=123](http://localhost:3300/user/login?name=aaa&password=123)

###退出
[http://localhost:3300/user/logout](http://localhost:3300/user/logout]()

###获取用户列表
[http://localhost:3300/user/getUserList](http://localhost:3300/user/getUserList)

###更改用户类型
5种类型：'no','normal','vc','admin','forbid'
[http://localhost:3300/user/modifyType?newType=vc](http://localhost:3300/user/modifyType?newType=vc)

###更改密码
[http://localhost:3300/user/modifyPassword?oldPassword=456&newPassword=123](http://localhost:3300/user/modifyPassword?oldPassword=456&newPassword=123)

###更改用户信息
[http://localhost:3300/user/modifyInfo?newNickName=test&newMail=qq.com&newPhone=152](http://localhost:3300/user/modifyInfo?newNickName=test&newMail=qq.com&newPhone=152)

----
##企业接口
###注册(post)
[]()
###登录
[http://localhost:3300/company/login?name=aaa&password=123](http://localhost:3300/company/login?name=aaa&password=123)
###登出
[http://localhost:3300/company/logout](http://localhost:3300/company/logout)
###获取企业详细信息
[http://localhost:3300/company/getCompanyByName?name=xxx]()
###分类获取企业列表
[http://localhost:3300/company/logout](http://localhost:3300/company/getCompanyByField?field=xxx]()
###修改权限
[http://localhost:3300/company/modifyType?newType=xx](http://localhost:3300/company/modifyType?newType=xx)

###更改密码
[http://localhost:3300/company/modifyPassword?oldPassword=456&newPassword=123](http://localhost:3300/company/modifyPassword?oldPassword=456&newPassword=123)
###修改信息
[]()

----
##企业财务接口
###添加
[http://localhost:3300/finance/add?year=2016&ratio=xxx&input=xxx&increase=xxx&allCapital=xxx&realCapital=xxx&allRatio=xxx&realRatio=xxx&debtRatio=xxx&inputRatio=xxx]()
###修改
[http://localhost:3300/finance/modify?year=2016&ratio=xxx&input=xxx&increase=xxx&allCapital=xxx&realCapital=xxx&allRatio=xxx&realRatio=xxx&debtRatio=xxx&inputRatio=xxx]()
###删除
[http://localhost:3300/finance/delete?year=2016]()
###获取公司全部财务列表
[http://localhost:3300/finance/getFinanceList]()
###获取公司某年财务列表
[http://localhost:3300/finance/getFinance?year=2016]()

----
##企业资讯接口
###添加(post)
[http://localhost:3300/news/add]()

post表单：title,author,isFirst,isOnline,tag,desc,pic,wysiwyg
###修改
[http://localhost:3300/news/modify?id=xxx&title=xxx&author=xxx&isFirst=xxx&tag=xxx&desc=xxx&pic=xxx&wysiwyg=xxx]()
###删除
[http://localhost:3300/news/delete?id=xxx]()
###设置上线／下线
[http://localhost:3300/news/modifyOnline?id=xxx&type=xxx]()
###根据分类获取资讯
[http://localhost:3300/news/getNewsByField?tag=xxx]()
###根据公司获取资讯
[http://localhost:3300/news/getNewsByCompany?company=xxx]()
###获取某资讯详情
[http://localhost:3300/news/getNewsById?id=xxx]()

----
##企业用户测评接口
###添加
[http://localhost:3300/privateReport/add?title=xxx&product=xxx&date=xxx&type=xxx&maxUserNum=xxx]()
###修改
[http://localhost:3300/privateReport/modify?id=xxx&title=xxx&product=xxx&date=xxx]()
###删除
[http://localhost:3300/privateReport/delete?id=xxx]()
###设置上线／下线(废弃)
[http://localhost:3300/privateReport/]()
###根据分类获取测评列表
[http://localhost:3300/privateReport/getPriReportByField?type=x]()
###根据公司获取测评列表
[http://localhost:3300/privateReport/getPriReportByCompany?companyName=xxx]()
###根据是否结束获取测评列表
[http://localhost:3300/privateReport/getPriReportByState?state=2]()
###获取单个测评详情
[http://localhost:3300/privateReport/getPriReportById?id=xxx]()
###用户报名
[http://localhost:3300/privateReport/sign?id=xxx&newName=xxx]()
###审核通过用户报名
[http://localhost:3300/privateReport/pass?id=xxx&newName=xxx]()

----
##企业专业测评接口
###添加
[http://localhost:3300/publicReport/add?productId=xxx&productName=xxx&date=xxx&team=xxx&site=xxx]()
###修改
[http://localhost:3300/publicReport/modify?id=xxx&productId=xxx&productName=xxx&date=xxx&team=xxx&site=xxx]()
###删除
[http://localhost:3300/publicReport/delete?id=xxx]()
###设置上线／下线
[http://localhost:3300/publicReport/modifyOnline?id=xxx&isOnline=1]()
###根据是否上线获取测评列表
[http://localhost:3300/publicReport/getPubReportByOnline?isOnline=1]()
###根据公司获取测评列表
[http://localhost:3300/publicReport/getPubReportByCompany?companyName=xxx]()


