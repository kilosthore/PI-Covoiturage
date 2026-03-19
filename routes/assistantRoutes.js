const express = require('express')
const router  = express.Router()
const Groq    = require('groq-sdk')

router.post('/assistant', async (req, res) => {
  const { message } = req.body

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      max_tokens: 500,
      messages: [
        {
          role: 'system',
          content: `Tu es l'assistant virtuel de CitéCovoit, une plateforme de covoiturage gratuite au Québec et au Canada. Tu aides les passagers et les conducteurs avec leurs questions sur le covoiturage. Tu réponds toujours en français, de façon courte et claire (maximum 3-4 phrases). Si la question ne concerne pas le covoiturage, redirige poliment vers le sujet.`
        },
        {
          role: 'user',
          content: message
        }
      ]
    })

    const reponse = completion.choices[0].message.content
    res.json({ reponse })

  } catch (err) {
    console.log('Erreur Groq :', err.message)
    res.json({ reponse: "Désolé, je suis temporairement indisponible. Réessayez dans un moment." })
  }
})

module.exports = router