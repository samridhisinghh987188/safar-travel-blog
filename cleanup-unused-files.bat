@echo off
echo Cleaning up unused files from SAFAR Travel Blog...
echo.

REM Remove unused page files
echo Removing unused page files...
del "src\pages\BlogPage.jsx" 2>nul
del "src\pages\Blog-clean.jsx" 2>nul
del "src\pages\SignIn.jsx" 2>nul
del "src\pages\SignUp.jsx" 2>nul
del "src\pages\BlogPostPage.jsx" 2>nul

REM Remove unused component files
echo Removing unused component files...
del "src\components\animated-blog-cards.jsx" 2>nul
del "src\components\scroll-animation-section.jsx" 2>nul
del "src\components\location-info.jsx" 2>nul
del "src\components\map-component.jsx" 2>nul

REM Remove unused utility files
echo Removing unused utility files...
del "src\utils\dbSchema.js" 2>nul
del "src\utils\debugStorage.js" 2>nul
del "src\utils\setupStorage.js" 2>nul
del "src\initStorage.js" 2>nul

REM Remove unused data files (uncomment if you're sure)
REM del "src\data\blogPosts.json" 2>nul

echo.
echo Cleanup completed!
echo Please review the changes and test your application.
echo If everything works fine, commit the changes to git.
pause
