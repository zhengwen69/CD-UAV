# CD-UAV 同步脚本
# 双击运行：将固废主门户的 UAV 相关文件同步至 CD-UAV 独立仓库并推送
# 用法：右键 → 使用 PowerShell 运行

$ErrorActionPreference = 'Stop'

$src = "C:\Users\H1811\Desktop\CDU 固废备课文件夹2026\演示展示"
$dst = "C:\Users\H1811\Desktop\CDU 固废备课文件夹2026\CD-UAV"
$git = "C:\Users\H1811\AppData\Local\GitHubDesktop\app-3.5.11\resources\app\git\cmd\git.exe"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CD-UAV Sync Tool v1.0" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Files to sync (relative paths)
$syncFiles = @(
    "迁移探索-无人机应用技术.html",
    "迁移探索-无人机-学生伴学子门户.html",
    "js/i18n.js",
    "lang/zh.json",
    "lang/en.json",
    "lang/fr.json",
    "lang/de.json",
    "lang/th.json",
    "lang/ja.json",
    "lang/ko.json",
    "lang/zh-Hant.json",
    "Figure1-知识域映射轨迹.png",
    "Figure2-迁移探索枢纽页.png",
    "Figure3-无人机应用技术页面.png"
)

$updated = @()
foreach ($f in $syncFiles) {
    $srcPath = Join-Path $src $f
    $dstPath = Join-Path $dst $f
    
    if (-not (Test-Path -LiteralPath $srcPath)) {
        Write-Host "  SKIP (source missing): $f" -ForegroundColor Gray
        continue
    }
    
    $srcHash = (Get-FileHash -LiteralPath $srcPath -Algorithm MD5).Hash
    $dstHash = if (Test-Path -LiteralPath $dstPath) { (Get-FileHash -LiteralPath $dstPath -Algorithm MD5).Hash } else { "" }
    
    if ($srcHash -ne $dstHash) {
        Copy-Item -LiteralPath $srcPath -Destination $dstPath -Force
        $updated += $f
        Write-Host "  SYNC: $f" -ForegroundColor Green
    } else {
        Write-Host "  OK:   $f" -ForegroundColor Gray
    }
}

if ($updated.Count -eq 0) {
    Write-Host "`nNo changes detected. CD-UAV is up to date." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
    exit
}

Write-Host ""
Write-Host "Updated $($updated.Count) file(s). Committing..." -ForegroundColor Yellow

Push-Location $dst

try {
    & $git add -A
    $msg = "Sync: $($updated -join ', ')"
    & $git commit -m $msg
    & $git push origin gh-pages
    Write-Host "`nPushed to GitHub. Live at:" -ForegroundColor Green
    Write-Host "  https://zhengwen69.github.io/CD-UAV/" -ForegroundColor Cyan
} catch {
    Write-Host "`nGit push failed. Try GitHub Desktop → Push origin." -ForegroundColor Red
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
