# 📱 Виджеты для iOS (через Scriptable)

## ⚠️ Важно!
**iOS НЕ поддерживает веб-виджеты напрямую.**

Но можно использовать приложение **Scriptable** (бесплатно):

## Установка:

### Шаг 1: Установи Scriptable
1. Открой **App Store**
2. Найди **"Scriptable"**
3. Скачай (бесплатно)

### Шаг 2: Создай скрипт
1. Открой **Scriptable**
2. Нажми **"+"** (новый скрипт)
3. Скопируй код ниже
4. Вставь в скрипт
5. Измени URL на свой ngrok URL
6. Сохрани (назови "Salary Bot")

### Шаг 3: Код виджета

\`\`\`javascript
// Salary Bot Widget
const API_URL = "https://your-ngrok-url/api/entries"

let widget = new ListWidget()
widget.backgroundColor = new Color("#667eea")

try {
  let req = new Request(API_URL)
  let data = await req.loadJSON()
  
  let today = new Date()
  let key = `${today.getMonth() + 1}.${today.getFullYear()}`
  let entries = data.data[key] || []
  
  let todayStr = `${today.getDate().toString().padStart(2, '0')}.${(today.getMonth() + 1).toString().padStart(2, '0')}.${today.getFullYear()}`
  
  let total = entries
    .filter(e => e.date === todayStr)
    .reduce((sum, e) => sum + (e.amount || e.salary || 0), 0)
  
  let title = widget.addText("Сегодня")
  title.textColor = Color.white()
  title.font = Font.caption1()
  title.textOpacity = 0.9
  
  widget.addSpacer(4)
  
  let amount = widget.addText(total.toLocaleString() + "₽")
  amount.textColor = Color.white()
  amount.font = Font.boldSystemFont(28)
  
  widget.addSpacer()
  
  let footer = widget.addText("Salary Bot")
  footer.textColor = Color.white()
  footer.font = Font.caption2()
  footer.textOpacity = 0.7
  
} catch (e) {
  let error = widget.addText("Ошибка загрузки")
  error.textColor = Color.white()
  error.font = Font.caption1()
}

Script.setWidget(widget)
widget.presentSmall()
Script.complete()
\`\`\`

3. Добавь виджет **Scriptable** на главный экран
4. Выбери созданный скрипт

---

## 🎯 Roadmap

- [ ] Нативный iOS Widget (требуется Swift)
- [ ] Android Widget (требуется Kotlin)
- [ ] Web App Manifest widgets (когда iOS добавит поддержку)
