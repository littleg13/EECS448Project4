# Maintenance Plan

This plan will be split into two parts: (1) costs to host our application and
(2) costs to continue development or add features.

For the first part of the plan, we have actually deployed our application and
know the costs associated with it. One known cost is the domain. Nick bought the
domain from Google Domains for $12 a year. This cost is constant unless a
different top level domain (TDL) is chosen. For example, .com and .net are both
$12 a year from multiple registrars. However, the TDL .io is popular with web
based games such as this, and those are typically $60 dollars a year.

Another known cost for hosting the application is the server. Currently the web
and game server are hosted on the same virtual private server (VPS), purchased
from Digital Ocean. We are running on the most inexpensive server they offer,
only $5 a month. This cost how ever this not constant and will increase with
traffic. With an increase in popularity and traffic, the server could be easily
migrated to a more expensive (faster) server in an hour maximum.

An unknown cost would be an additional server if a single server could not
handle the increased traffic. At some point we would need to split the web
server from the game server. This would allow one server to be responsible for
only serving content like the images, HTML, CSS, and JS files. The other would
only run the game code like processing game events and generating maps. If
traffic continued to grow, we would need to host multiple game servers and code
would need to be written that load balances between them. This is beyond our
capabilities and would require hiring a developer with knowledge of scalable web
applications hosted in the cloud. (I don't think I could make that sentence more
buzz-wordy if I tried)

The second part of this plan includes continuing development and the cost of
adding features. With our group members being full time students, continuing to
develop this application in our off time is not sustainable and would lead to
either subpar code or incomplete work. Hiring a developer to do this for us
would be the ideal choice in this case. Glassdoor reports the average salary of
a freelance software developer is around $100k. This would fluctuate based on
where they were based and how much they would need to do. Our project most
likely doesn't need someone devoted to it full time, and the cost of living in
Lawrence is lower than average. With this in mind, we could probably find
someone willing to do what we needed closer to the $20k - $30k range per year.


Based upon current popularity and development techniques, this application costs
$6/month to host and maintain. Costs would increase with an increase in
popularity and the addition of major features.
