/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: API for posts
 */
/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: Favorite management
 */
/**
 * @swagger
 * /posts/create:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contenu:
 *                 type: string
 *               contenuMedia:
 *                 type: string
 *             required:
 *               - contenu
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /posts/{postId}:
 *   put:
 *     summary: Modify an existing post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to modify
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contenu:
 *                 type: string
 *               contenuMedia:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post modified successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to delete
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */

/**
 * @swagger
 * /posts/{postId}/comment:
 *   post:
 *     summary: Add a comment to a post
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to comment on
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *             required:
 *               - text
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */

/**
 * @swagger
 * /posts/{postId}/comment:
 *   get:
 *     summary: Get all comments for a post
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to get comments for
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *       404:
 *         description: Post not found
 */

/**
 * @swagger
 * /posts/{postId}/comment/{commentId}:
 *   put:
 *     summary: Update a comment on a post
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *             required:
 *               - text
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post or comment not found
 */

/**
 * @swagger
 * /posts/{postId}/comment/{commentId}:
 *   delete:
 *     summary: Delete a comment on a post
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment to delete
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post or comment not found
 */

/**
 * @swagger
 * /posts/{postId}/view:
 *   get:
 *     summary: Increment views for a post
 *     tags: [Views]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to view
 *     responses:
 *       200:
 *         description: Post views incremented successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */

/**
 * @swagger
 * /posts/{postId}/views:
 *   get:
 *     summary: Get views for a post
 *     tags: [Views]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to get views for
 *     responses:
 *       200:
 *         description: Post views retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */

/**
 * @swagger
 * /posts/accueil:
 *   get:
 *     summary: Get the news feed
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: News feed retrieved successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /posts/{type}/{idpost}:
 *   get:
 *     summary: Like or dislike a post
 *     tags: [Likes/Dislikes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: The type of action (like or dislike)
 *       - in: path
 *         name: idpost
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to like or dislike
 *     responses:
 *       200:
 *         description: Action completed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */

/**
 * @swagger
 * /posts/share:
 *   post:
 *     summary: Share a post with another user within the application
 *     tags: [Shares]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *               userId:
 *                 type: string
 *             required:
 *               - postId
 *               - userId
 *     responses:
 *       200:
 *         description: Post shared successfully
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /posts/share/email:
 *   post:
 *     summary: Share a post via email
 *     tags: [Shares]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *               email:
 *                 type: string
 *             required:
 *               - postId
 *               - email
 *     responses:
 *       200:
 *         description: Post shared via email successfully
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /posts/share/facebook:
 *   post:
 *     summary: Share a post on Facebook
 *     tags: [Shares]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *               facebookId:
 *                 type: string
 *             required:
 *               - postId
 *               - facebookId
 *     responses:
 *       200:
 *         description: Post shared on Facebook successfully
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /posts/share/whatsapp:
 *   post:
 *     summary: Share a post on WhatsApp
 *     tags: [Shares]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *             required:
 *               - postId
 *               - phoneNumber
 *     responses:
 *       200:
 *         description: Post shared on WhatsApp successfully
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /posts/signale:
 *   post:
 *     summary: Report a post
 *     tags: [Reports]
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
 *               reason:
 *                 type: string
 *             required:
 *               - postId
 *               - reason
 *     responses:
 *       200:
 *         description: Post reported successfully
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /posts/find:
 *   get:
 *     summary: Search for a user or post
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: value
 *         required: true
 *         schema:
 *           type: string
 *         description: The value to search for
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *       400:
 *         description: Bad request
 */
