exports.get404Page = (req, res) => {
    res.status(404).render("error/404", {title: "Page Not Found"});
   }


exports.get500Page = (error, req, res, next) => {
    //console.log(err.message);
    res.status(500)
    .render("error/500", 
    {title: "Something went wrong",
     message: err.message});
   }