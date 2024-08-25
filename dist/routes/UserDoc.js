"use strict";
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and authentication
 */
/**
 * @swagger
 * tags:
 *   name: Credits
 *   description: User credit management
 */
/**
* @swagger
* tags:
*   name: Followers
*   description: API for managing followers
*/
/**
 * @swagger
 * tags:
 *   name: Votes
 *   description: Voting management
 */
/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: User messages management
 */
/**
 * @swagger
 * tags:
 *   name: Votes
 *   description: API for managing votes
 */
/**
 * @swagger
 * /users/create:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               role:
 *                 type: string
 *               password:
 *                 type: string
 *               telephone:
 *                 type: string
 *               mail:
 *                 type: string
 *               passconfirm:
 *                 type: string
 *             required:
 *               - nom
 *               - prenom
 *               - role
 *               - password
 *               - telephone
 *               - mail
 *               - passconfirm
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 */
/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get the profile of the connected user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /users/login2:
 *   post:
 *     summary: Log in a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mail:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - mail
 *               - password
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /follow:
 *   post:
 *     summary: Add or remove a follower for a user
 *     tags: [Followers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               followedId:
 *                 type: string
 *                 description: The ID of the user to follow or unfollow
 *             required:
 *               - followedId
 *     responses:
 *       200:
 *         description: Successfully followed or unfollowed the user
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /followers:
 *   get:
 *     summary: List followers of the logged-in user
 *     tags: [Followers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of followers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                   username:
 *                     type: string
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /followings:
 *   get:
 *     summary: List users followed by the logged-in user
 *     tags: [Followers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of followings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                   username:
 *                     type: string
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /users/achatCredit:
 *   post:
 *     summary: Purchase credits for the user
 *     tags: [Credits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *             required:
 *               - amount
 *     responses:
 *       200:
 *         description: Credits purchased successfully
 *       400:
 *         description: Bad request
 */
/**
 * @swagger
 * /users/modifyProfile:
 *   post:
 *     summary: Change the profile to 'tailleur'
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile changed successfully
 *       400:
 *         description: Bad request
 */
/**
 * @swagger
 * /users/favorite:
 *   post:
 *     summary: Add or remove a post from favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *             required:
 *               - postId
 *     responses:
 *       200:
 *         description: Favorite added or removed successfully
 *       400:
 *         description: Bad request
 */
/**
 * @swagger
 * /users/favorite:
 *   get:
 *     summary: List the favorite posts of the connected user
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Favorites retrieved successfully
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /vote:
 *   post:
 *     summary: Add or remove a vote for a post
 *     tags: [Votes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               voteForUserId:
 *                 type: string
 *                 description: The ID of the user receiving the vote
 *             required:
 *               - voteForUserId
 *     responses:
 *       200:
 *         description: Successfully added or removed the vote
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /users/messages:
 *   get:
 *     summary: Get messages for the connected user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /users/messages:
 *   post:
 *     summary: Send a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receiver:
 *                 type: string
 *               content:
 *                 type: string
 *             required:
 *               - receiver
 *               - content
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Bad request
 */
/**
 * @swagger
 * /users/discussion/{otherUserId}:
 *   get:
 *     summary: Get a discussion with another user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: otherUserId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the other user
 *     responses:
 *       200:
 *         description: Discussion retrieved successfully
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /users/profile/{userId}:
 *   get:
 *     summary: Get the profile of a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /users/notification:
 *   get:
 *     summary: Get notifications for the connected user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /users/article:
 *   post:
 *     summary: Add a new article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idVendeur
 *               - libelle
 *               - prixUnitaire
 *               - quantiteStock
 *             properties:
 *               idVendeur:
 *                 type: integer
 *                 description: ID of the seller
 *               libelle:
 *                 type: string
 *                 description: Name of the article
 *               prixUnitaire:
 *                 type: number
 *                 description: Unit price of the article
 *               quantiteStock:
 *                 type: integer
 *                 description: Stock quantity
 *     responses:
 *       201:
 *         description: Article created successfully
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 *
 *   get:
 *     summary: Get articles of the connected user
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Articles retrieved successfully
 *       401:
 *         description: Unauthorized
 *
 *   put:
 *     summary: Update an existing article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idVendeur
 *               - libelle
 *               - prixUnitaire
 *               - quantiteStock
 *             properties:
 *               idVendeur:
 *                 type: integer
 *                 description: ID of the seller
 *               libelle:
 *                 type: string
 *                 description: Name of the article
 *               prixUnitaire:
 *                 type: number
 *                 description: Unit price of the article
 *               quantiteStock:
 *                 type: integer
 *                 description: Stock quantity
 *     responses:
 *       200:
 *         description: Article updated successfully
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 *
 *   delete:
 *     summary: Delete an article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idArticle
 *             properties:
 *               idArticle:
 *                 type: integer
 *                 description: ID of the article to delete
 *     responses:
 *       200:
 *         description: Article deleted successfully
 *       401:
 *         description: Unauthorized
 *
 * /users/commande:
 *   post:
 *     summary: Create a new commande
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - articles
 *             properties:
 *               articles:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     idArticle:
 *                       type: integer
 *                     quantite:
 *                       type: integer
 *                 description: List of articles in the commande
 *     responses:
 *       201:
 *         description: Commande created successfully
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 *
 *   get:
 *     summary: List commandes for a vendor
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Commandes retrieved successfully
 *       401:
 *         description: Unauthorized
 *
 * /users/commande/:orderId:
 *   put:
 *     summary: Validate a commande
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the commande to validate
 *     responses:
 *       200:
 *         description: Commande validated successfully
 *       401:
 *         description: Unauthorized
 *
 *   delete:
 *     summary: Cancel a commande
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the commande to cancel
 *     responses:
 *       200:
 *         description: Commande canceled successfully
 *       401:
 *         description: Unauthorized
 *
 * /users/commande-c:
 *   get:
 *     summary: List commandes for a client
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Commandes retrieved successfully
 *       401:
 *         description: Unauthorized
 */
